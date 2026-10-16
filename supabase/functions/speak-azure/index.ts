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
        JSON.stringify({ error: "Missing text or voiceId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const azureKey = Deno.env.get("AZURE_SPEECH_KEY");
    const azureRegion = Deno.env.get("AZURE_SPEECH_REGION") || "eastus";

    if (!azureKey) {
      console.error("AZURE_SPEECH_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Azure TTS not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Map speed (0.72–1.05) to Azure prosody rate percentage
    const ratePercent = Math.round((speed - 1.0) * 100);
    const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

    const escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-AU"><voice name="${voiceId}"><prosody rate="${rateStr}">${escapedText}</prosody></voice></speak>`;

    const response = await fetch(
      `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": azureKey,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
          "User-Agent": "NativeTalk",
        },
        body: ssml,
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("Azure TTS error:", response.status, detail);
      return new Response(
        JSON.stringify({ error: "Azure TTS failed", detail }),
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
    console.error("speak-azure error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
