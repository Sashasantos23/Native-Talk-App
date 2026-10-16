import { useState, useRef, useEffect, useCallback } from "react";
import type { TryPhrase } from "@/lib/storage";
import { GhostButton, ListenButton, WaveBars, LoadingDots, Spinner } from "@/components/NativeTalkUI";
import {
  type ChatMessage, type UserProfile,
  SCENARIOS, LEVELS, MODES, ALL_VOICES, SPEECH_RATE, ACCENTS,
} from "@/lib/constants";
import AvatarImg from "@/components/AvatarImg";
import { stopSpeaking, canRecord } from "@/lib/tts";
import { formatCoachTip } from "@/lib/formatCoachTip";

interface ChatScreenProps {
  profile: UserProfile;
  level: string;
  scenario: string;
  mode: string;
  gender: string;
  voiceId: string;
  messages: ChatMessage[];
  loading: boolean;
  coachMap: Record<number, string>;
  ptMap: Record<number, string>;
  shadowLine: string | null;
  feedback: string | null;
  showFeedback: boolean;
  timerSignal: number;
  tryPhrases: TryPhrase[];
  onSend: (text: string) => void;
  onGetFeedback: () => void;
  onExit: () => void;
}

export default function ChatScreen({
  profile, level, scenario, mode, gender, voiceId,
  messages, loading, coachMap, ptMap, shadowLine, feedback, showFeedback,
  timerSignal, tryPhrases,
  onSend, onGetFeedback, onExit,
}: ChatScreenProps) {
  const [input, setInput] = useState("");
  const [recState, setRecState] = useState<"idle" | "requesting" | "recording" | "error">("idle");
  const [interimText, setInterimText] = useState("");
  const [timer, setTimer] = useState(25);
  const [timerOn, setTimerOn] = useState(false);
  const recRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  const rate = SPEECH_RATE[level] || 0.95;
  const scenObj = SCENARIOS.find(s => s.id === scenario);
  const levelObj = LEVELS.find(l => l.id === level);
  const voiceObj = ALL_VOICES.find(v => v.id === voiceId);
  const modeObj = MODES.find(m => m.id === mode);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Timer interval
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (mode === "pressure" && timerOn) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setTimerOn(false);
            return 25;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [timerOn, timerSignal, mode, clearTimer]);

  // timerSignal from parent: start timer after TTS ends
  useEffect(() => {
    if (timerSignal > 0 && mode === "pressure") {
      clearTimer();
      setTimer(25);
      setTimerOn(true);
    }
  }, [timerSignal, mode, clearTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopSpeaking(); clearTimer(); stopRecording(); };
  }, []);

  const stopRecording = useCallback(() => {
    if (recRef.current) { try { recRef.current.stop(); } catch {} recRef.current = null; }
    setRecState("idle");
    setInterimText("");
  }, []);

  const startRecording = useCallback(() => {
    if (recState === "recording") { stopRecording(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setRecState("error"); return; }
    stopSpeaking();
    setRecState("requesting");
    setInterimText("");

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onstart = () => setRecState("recording");
    rec.onresult = (e: any) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      if (final.trim()) { setInput(prev => (prev + " " + final).trim()); setInterimText(""); }
      else setInterimText(interim);
    };
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setRecState("error");
      else setRecState("idle");
      setInterimText(""); recRef.current = null;
    };
    rec.onend = () => {
      setRecState(s => (s === "recording" || s === "requesting") ? "idle" : s);
      setInterimText(""); recRef.current = null;
    };

    recRef.current = rec;
    try { rec.start(); } catch { setRecState("idle"); recRef.current = null; }
  }, [recState, stopRecording]);

  const handleSend = () => {
    const txt = input.trim();
    if (!txt || loading) return;
    stopRecording();
    setInput("");
    onSend(txt);
    // Pause timer while AI is thinking — it restarts via timerSignal after TTS ends
    if (mode === "pressure") { clearTimer(); setTimerOn(false); setTimer(25); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const timerPct = (timer / 25) * 100;
  const timerColor = timer > 15 ? "#4aaa70" : timer > 8 ? "hsl(var(--gold))" : "hsl(var(--destructive))";
  const visibleMessages = messages
    .map((message, originalIndex) => ({ message, originalIndex }))
    .filter(({ message }) => message.content !== "Begin the scenario.");
  const lastAiMsg = visibleMessages.length > 0 && visibleMessages[visibleMessages.length - 1].message.role === "assistant";

  const micClass = recState === "recording" ? "animate-pulse-red border-destructive bg-destructive-soft"
    : recState === "requesting" ? "animate-pulse-gold border-primary bg-card"
    : recState === "error" ? "border-destructive border-dashed bg-destructive-soft"
    : "border-border bg-card hover:border-primary hover:bg-navy-hover";

  return (
    <div className="w-full max-w-[700px] mx-auto flex flex-col h-screen bg-background font-body text-foreground">
      {/* Timer bar */}
      {mode === "pressure" && (
        <div className="h-1 bg-border flex-shrink-0">
          <div className="h-full rounded-sm transition-all duration-1000" style={{ background: timerColor, width: `${timerPct}%` }} />
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 bg-navy flex-shrink-0 flex-wrap">
        <GhostButton onClick={onExit} className="text-xs px-2 py-1">← Exit</GhostButton>
        <span className="text-base">{scenObj?.emoji}</span>
        <span className="font-display font-semibold text-sm text-foreground">{scenObj?.label}</span>
        <div className="ml-auto flex gap-1.5 items-center flex-wrap">
          <span className="bg-navy-mid border border-border rounded-md px-2 py-0.5 text-[0.67rem] text-primary">{levelObj?.emoji} {levelObj?.label}</span>
          <span className="bg-navy-mid border border-border rounded-md px-2 py-0.5 text-[0.67rem] text-cream-mid">{gender === "female" ? "👩" : "👨"} {voiceObj?.name}</span>
          {mode !== "normal" && <span className="bg-navy-mid border border-border rounded-md px-2 py-0.5 text-[0.67rem] text-muted-foreground">{modeObj?.emoji} {modeObj?.label}</span>}
          {mode === "pressure" && timerOn && (
            <span className="bg-navy-mid border rounded-md px-2 py-0.5 text-xs font-display font-bold min-w-[34px] text-center" style={{ borderColor: timerColor, color: timerColor }}>{timer}s</span>
          )}
        </div>
        <GhostButton onClick={onGetFeedback} className="text-xs px-2 py-1">📝 Feedback</GhostButton>
      </div>

      {/* Help bar */}
      <div className="bg-navy border-b border-border px-4 py-1 flex gap-4 text-[0.64rem] text-border">
        <span>🔊 Tap <strong className="text-muted">Listen</strong> on any bubble to hear it</span>
        {canRecord ? <span>🎙️ Tap mic to record</span> : <span className="text-destructive">⚠️ Voice input not supported</span>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 flex flex-col gap-3">
        {visibleMessages.map(({ message: m, originalIndex }, i) => {
          const tip = m.role === "assistant" ? coachMap[originalIndex] : null;
          const pt = m.role === "assistant" && level === "starter" ? ptMap[originalIndex] : null;
          const showShadow = m.role === "assistant" && i === visibleMessages.length - 1 && shadowLine && mode === "shadow";
          return (
            <div key={originalIndex} className="animate-fade-in flex items-start gap-1.5" style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "assistant" && (
                <div className="w-[36px] h-[36px] rounded-full overflow-hidden flex-shrink-0 mt-0.5 border"
                  style={{ borderColor: "hsl(var(--gold) / 0.3)" }}>
                  <AvatarImg voiceId={voiceId} gender={gender} size={36} />
                </div>
              )}
              <div style={{ maxWidth: "75%" }}>
                <div className={`px-3.5 py-3 font-body text-sm leading-relaxed rounded-2xl border ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-[hsl(230,70%,28%)] to-[hsl(230,65%,20%)] rounded-br-sm border-[hsl(230,55%,32%)]"
                    : "bg-card rounded-bl-sm border-border"
                }`}>
                  {m.content}
                </div>
                {pt && (
                  <div className="flex items-start gap-1.5 mt-1 px-3 py-2 rounded-bl-none rounded-xl border"
                    style={{
                      background: "hsl(var(--gold) / 0.04)",
                      borderColor: "hsl(var(--gold) / 0.15)",
                    }}>
                    <span className="text-[0.68rem] flex-shrink-0 mt-px">🇧🇷</span>
                    <p className="text-xs text-muted-foreground leading-relaxed italic m-0">{pt}</p>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <ListenButton text={m.content} gender={gender} speed={rate} voiceId={voiceId} />
                </div>
                {tip && (
                  <div className="mt-1.5 flex gap-2 items-start p-2 rounded-r-lg" style={{
                    background: "hsl(var(--gold) / 0.07)",
                    borderLeft: "3px solid hsl(var(--gold))",
                  }}>
                    <span className="text-sm flex-shrink-0">💡</span>
                    <p className="text-xs leading-relaxed flex-1" style={{ color: "#d4b870" }}>{formatCoachTip(tip)}</p>
                  </div>
                )}
                {showShadow && (
                  <div className="mt-2 p-3 rounded-r-xl" style={{
                    background: "hsl(var(--navy) / 0.6)",
                    borderLeft: "3px solid #6080cc",
                  }}>
                    <p className="text-[0.65rem] tracking-wider uppercase mb-1" style={{ color: "#7090d0" }}>🔄 Shadow this sentence</p>
                    <p className="font-body text-sm leading-relaxed mb-1.5" style={{ color: "#90b0e8" }}>"{shadowLine}"</p>
                    <div className="flex gap-2 items-center">
                      <ListenButton text={shadowLine!} gender={gender} speed={0.82} voiceId={voiceId} />
                      <span className="text-[0.68rem] text-border">← Listen first, then try</span>
                    </div>
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5 border border-border"
                  style={{ background: "linear-gradient(135deg, hsl(var(--navy)), hsl(var(--navy-mid)))" }}>👤</div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-1.5">
            <div className="w-[36px] h-[36px] rounded-full overflow-hidden flex-shrink-0 border"
              style={{ borderColor: "hsl(var(--gold) / 0.3)" }}>
              <AvatarImg voiceId={voiceId} gender={gender} size={36} />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-3 flex gap-1.5 items-center">
              <LoadingDots />
            </div>
          </div>
        )}

        {mode === "pressure" && !timerOn && !loading && lastAiMsg && (
          <div className="text-center animate-fade-in">
            <span className="bg-destructive-soft border border-destructive/30 rounded-lg px-2.5 py-1 text-xs" style={{ color: "#e06060" }}>
              ⏰ Don't overthink — just say something!
            </span>
          </div>
        )}

        {showFeedback && (
          <div className="animate-fade-in">
            <p className="text-primary text-[0.68rem] tracking-wider uppercase mb-1">📝 Coach Feedback</p>
            {feedback ? (
              <div className="bg-navy/50 border border-gold-border rounded-lg p-4 text-sm leading-relaxed text-cream-mid whitespace-pre-line">{feedback}</div>
            ) : (
              <div className="bg-navy/50 border border-gold-border rounded-lg p-4 flex gap-1.5 items-center">
                <LoadingDots />
                <span className="ml-2 text-muted-foreground text-sm">Analyzing your conversation…</span>
              </div>
            )}
          </div>
        )}
        <div ref={chatEnd} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-border bg-navy flex-shrink-0">
        {recState === "recording" && (
          <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-1 bg-destructive-soft border border-destructive/25 rounded-lg">
            <WaveBars active className="h-[13px] [&>span]:bg-destructive" />
            <span className="text-xs italic flex-1" style={{ color: "#d07070" }}>{interimText || "Listening… speak now"}</span>
            <span className="text-[0.68rem]" style={{ color: "#904040" }}>tap mic to stop</span>
          </div>
        )}
        {recState === "requesting" && (
          <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-1 bg-gold-soft border border-gold-border rounded-lg">
            <Spinner size={11} />
            <span className="text-xs text-primary">Requesting microphone permission…</span>
          </div>
        )}
        {recState === "error" && (
          <div className="flex items-center gap-1.5 mb-1.5 px-2.5 py-1 bg-destructive-soft border border-destructive/25 rounded-lg">
            <span className="text-xs" style={{ color: "#d07070" }}>⚠️ Microphone access denied. Please allow mic in browser settings.</span>
          </div>
        )}

        {/* Starter suggestion chips */}
        {level === "starter" && tryPhrases.length > 0 && !loading && (
          <div className="mb-2">
            <p className="text-[0.65rem] tracking-wider uppercase mb-1 text-muted-foreground">
              💡 Try saying one of these:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tryPhrases.map((phrase, pi) => (
                <button
                  key={pi}
                  onClick={() => onSend(phrase.english)}
                  className="rounded-xl px-3 py-2 text-xs font-body cursor-pointer transition-all hover:scale-105 active:scale-95 border text-primary flex flex-col items-start gap-0.5 text-left"
                  style={{
                    background: "hsl(var(--gold) / 0.1)",
                    borderColor: "hsl(var(--gold) / 0.3)",
                  }}
                >
                  <span className="font-semibold text-[0.8rem] leading-tight text-primary">
                    {phrase.english}
                  </span>
                  {phrase.pt && (
                    <span className="text-[0.68rem] leading-tight italic text-muted-foreground">
                      {phrase.pt}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-1.5 items-end">
          <textarea
            className="flex-1 bg-card border border-border rounded-lg px-4 py-2.5 text-foreground text-sm font-body resize-none outline-none transition-colors focus:border-primary placeholder:text-border leading-relaxed"
            rows={2}
            placeholder={recState === "recording" ? "Speak now — or type here…" : "Type your reply… or tap 🎙️ to speak"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {canRecord && (
            <button
              onClick={recState === "recording" ? stopRecording : startRecording}
              disabled={recState === "requesting"}
              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${micClass}`}
            >
              {recState === "recording" ? <WaveBars active className="h-[15px] [&>span]:bg-destructive" />
                : recState === "requesting" ? <Spinner size={13} />
                : recState === "error" ? <span className="text-sm">⚠️</span>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--gold))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>}
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl border-none flex items-center justify-center flex-shrink-0 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--navy))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-border text-[0.63rem] mt-1 text-center">
          Enter to send{canRecord ? " · Tap mic to speak" : ""}
        </p>
      </div>
    </div>
  );
}
