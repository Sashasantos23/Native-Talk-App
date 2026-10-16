import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Raw fetch on purpose: the Anthropic npm SDK fails at runtime in the Supabase Deno edge runtime.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, systemPrompt } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    // Claude rejects empty text blocks and needs the conversation to start with a user turn.
    const history = (Array.isArray(messages) ? messages : [])
      .filter((m: { role?: string; content?: unknown }) =>
        (m?.role === "user" || m?.role === "assistant") &&
        typeof m.content === "string" && m.content.trim() !== "")
      .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }));
    if (history.length === 0 || history[0].role !== "user") {
      history.unshift({ role: "user", content: "Begin the scenario." });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "server-side-fallback-2026-07-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-5-5",
        max_tokens: 16000,
        output_config: { effort: "low" },
        fallbacks: "default",
        // The system prompt is fixed for a whole practice session, so cache it;
        // the top-level marker also caches the growing conversation.
        cache_control: { type: "ephemeral" },
        system: [{ type: "text", text: systemPrompt || "", cache_control: { type: "ephemeral" } }],
        messages: history,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Claude API error:", response.status, t);
      if (response.status === 429 || response.status === 529) {
        return json({ error: "Rate limit exceeded. Please wait a moment and try again." }, 429);
      }
      return json({ error: "AI error" }, 500);
    }

    const data = await response.json();
    if (data.stop_reason === "refusal") {
      console.warn("Claude refusal:", JSON.stringify(data.stop_details));
      return json({ error: "Sorry, I can't continue with that. Let's try something else!" });
    }

    const content = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("")
      .trim();

    return json({ content });
  } catch (e) {
    console.error("chat error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
