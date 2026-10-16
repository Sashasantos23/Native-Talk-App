import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId, speed } = await req.json();

    if (!text || !voiceId) {
      return new Response(
        JSON.stringify({ error: "Missing voiceId or text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "TTS not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const safeSpeed = Math.min(Math.max(speed || 1.0, 0.7), 1.2);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.85,
            style: 0.0,
            use_speaker_boost: true,
            speed: safeSpeed,
          },
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      let providerStatus = "";
      let providerMessage = "";

      try {
        const parsed = JSON.parse(detail);
        const nested = parsed?.detail?.detail ?? parsed?.detail ?? parsed;
        providerStatus = String(nested?.status ?? "").toLowerCase();
        providerMessage = String(nested?.message ?? "").toLowerCase();
      } catch {
        // keep raw text parsing fallback
      }

      const rawLower = detail.toLowerCase();
      const blockedByProvider =
        providerStatus === "detected_unusual_activity" ||
        providerMessage.includes("unusual activity") ||
        rawLower.includes("detected_unusual_activity") ||
        response.status === 429;

      if (blockedByProvider) {
        console.warn("ElevenLabs usage blocked:", detail);
        return new Response(
          JSON.stringify({
            error: "TTS temporarily unavailable",
            code: "provider_blocked",
            detail: "Voice provider blocked this request",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      console.error("ElevenLabs error:", response.status, detail);
      return new Response(
        JSON.stringify({ error: "TTS upstream failed", detail }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (e) {
    console.error("speak error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
