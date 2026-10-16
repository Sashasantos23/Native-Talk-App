// TTS Engine for NativeTalk

let currentAudio: HTMLAudioElement | null = null;

const FEMALE_HINTS = ["samantha","karen","victoria","moira","tessa","fiona","ava","allison","joanna","salli","kimberly","kendra","aria","jenny","emma","amy","serena","zira","hazel","catherine"];
const MALE_HINTS = ["daniel","alex","tom","arthur","george","oliver","aaron","bruce","lee","james","brian","matthew","justin","joey","stephen","russell","fred"];

let _voices: SpeechSynthesisVoice[] = [];

function getVoices(): SpeechSynthesisVoice[] {
  if (_voices.length) return _voices;
  _voices = window.speechSynthesis?.getVoices() || [];
  return _voices;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    _voices = window.speechSynthesis.getVoices();
  };
}

function pickVoice(gender: string): SpeechSynthesisVoice | null {
  const voices = getVoices();
  const en = voices.filter(v => v.lang.startsWith("en"));
  if (!en.length) return null;
  const hints = gender === "female" ? FEMALE_HINTS : MALE_HINTS;
  const quality = ["neural","natural","enhanced","premium","wavenet","studio"];
  const scored = en.map(v => {
    let s = 0;
    const n = v.name.toLowerCase();
    if (hints.some(h => n.includes(h))) s += 20;
    quality.forEach((q, i) => { if (n.includes(q)) s += (6 - i) * 10; });
    if (v.localService) s += 3;
    return { v, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0]?.v || en[0] || null;
}

// Browser TTS fallback — must be called synchronously from click handler
export function browserSpeakSync(
  text: string,
  gender: string,
  speed: number,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();

  const speak = () => {
    const utt = new SpeechSynthesisUtterance(text);
    const v = pickVoice(gender);
    if (v) utt.voice = v;
    utt.rate = Math.min(Math.max(speed, 0.5), 2.0);
    utt.pitch = 1.0;
    utt.lang = "en-US";
    utt.onstart = () => onStart?.();
    utt.onend = () => onEnd?.();
    utt.onerror = () => onEnd?.();
    window.speechSynthesis.speak(utt);
  };

  if (getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", () => {
      _voices = window.speechSynthesis.getVoices();
      speak();
    }, { once: true });
    setTimeout(() => { if (!window.speechSynthesis.speaking) speak(); }, 500);
  } else {
    speak();
  }
}

// TTS via edge functions
const TTS_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speak`;

let edgeTtsDisabledForSession = false;


export async function speakViaEdge(
  text: string,
  voiceId: string,
  speed: number,
  genderHint: string,
  onStart?: () => void,
  onEnd?: () => void,
  endpoint?: string
) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }

  const fallbackToBrowser = () => {
    console.info("Falling back to browser TTS");
    browserSpeakSync(text, genderHint || "female", speed || 1.0, onStart, onEnd);
  };

  const url = endpoint || TTS_ENDPOINT;

  if (!voiceId || (!endpoint && edgeTtsDisabledForSession)) {
    fallbackToBrowser();
    return;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId, speed }),
    });

    if (res.ok) {
      const blobUrl = URL.createObjectURL(await res.blob());
      const audio = new Audio(blobUrl);
      currentAudio = audio;
      onStart?.();
      audio.onended = () => { URL.revokeObjectURL(blobUrl); currentAudio = null; onEnd?.(); };
      audio.onerror = () => { URL.revokeObjectURL(blobUrl); currentAudio = null; onEnd?.(); };
      audio.play().catch(() => {
        URL.revokeObjectURL(blobUrl);
        currentAudio = null;
        fallbackToBrowser();
      });
      return;
    }

    let errorCode = "";
    let detail = "";

    try {
      const payload = await res.json();
      errorCode = typeof payload?.code === "string" ? payload.code : "";
      detail = JSON.stringify(payload);
    } catch {
      detail = await res.text();
    }

    const blockedByProvider =
      res.status === 429 ||
      errorCode === "provider_blocked" ||
      /detected_unusual_activity/i.test(detail);

    if (blockedByProvider && !endpoint) {
      edgeTtsDisabledForSession = true;
      console.warn("Edge TTS provider blocked, using browser TTS for this session.");
    } else {
      console.warn("Edge TTS failed:", res.status, detail);
    }

    fallbackToBrowser();
  } catch (e) {
    console.warn("Edge TTS error:", e);
    fallbackToBrowser();
  }
}

// Main speak dispatcher — all voices via ElevenLabs
export function speakText(
  text: string,
  voiceId: string | undefined,
  genderHint: string,
  speed: number,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (voiceId) {
    speakViaEdge(text, voiceId, speed, genderHint || "female", onStart, onEnd);
  } else {
    browserSpeakSync(text, genderHint || "female", speed || 1.0, onStart, onEnd);
  }
}

export function stopSpeaking() {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  window.speechSynthesis?.cancel();
}

export const canRecord = typeof window !== "undefined" && !!(
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
);

export const canSpeak = typeof window !== "undefined" && !!window.speechSynthesis;
