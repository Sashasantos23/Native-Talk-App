import { useState } from "react";
import { Logo, GhostButton, GoldButton, SelectableCard, WaveBars, Spinner } from "@/components/NativeTalkUI";
import { ACCENTS, MODES, SCENARIOS, ALL_VOICES } from "@/lib/constants";
import AvatarImg from "@/components/AvatarImg";
import { stopSpeaking, speakText } from "@/lib/tts";

interface SetupScreenProps {
  onStartChat: (scenario: string) => void;
  onBack: () => void;
  accentId: string | null;
  setAccentId: (id: string) => void;
  gender: string | null;
  setGender: (g: string) => void;
  voiceId: string | null;
  setVoiceId: (id: string) => void;
  mode: string;
  setMode: (m: string) => void;
}

export default function SetupScreen({
  onStartChat, onBack,
  accentId, setAccentId, gender, setGender, voiceId, setVoiceId, mode, setMode,
}: SetupScreenProps) {
  const [step, setStep] = useState(0);
  const [showScenarios, setShowScenarios] = useState(false);
  const [previewSt, setPreviewSt] = useState<Record<string, string>>({});

  const accentObj = ACCENTS.find(a => a.id === accentId);
  const accVoices = accentObj
    ? gender === "female" ? accentObj.female : gender === "male" ? accentObj.male : []
    : [];

  const previewVoice = (vid: string) => {
    stopSpeaking();
    const v = ALL_VOICES.find(x => x.id === vid);
    const g = ACCENTS.flatMap(a => a.female).some(f => f.id === vid) ? "female" : "male";
    const text = `Hi! I'm ${v?.name}. I'll be your NativeTalk conversation partner — let's get started!`;
    setPreviewSt(s => ({ ...s, [vid]: "loading" }));
    speakText(text, vid, g, 1.0, () => setPreviewSt(s => ({ ...s, [vid]: "playing" })), () => setPreviewSt(s => ({ ...s, [vid]: "idle" })));
  };

  if (showScenarios) {
    return (
      <div className="min-h-screen bg-background font-body text-foreground flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[600px]">
          <div className="flex justify-between items-center mb-4">
            <Logo />
            <GhostButton onClick={() => setShowScenarios(false)} className="text-xs px-2.5 py-1">← Back</GhostButton>
          </div>
          <p className="text-primary font-display text-xs tracking-[2px] uppercase mb-1">Choose a scenario</p>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">What would you like to practice?</h2>
          <div className="grid grid-cols-2 gap-2">
            {SCENARIOS.map(s => (
              <SelectableCard key={s.id} selected={false} onClick={() => onStartChat(s.id)}>
                <div className="p-3.5 text-left">
                  <div className="text-xl mb-0.5">{s.emoji}</div>
                  <div className="font-display text-sm font-semibold text-foreground mb-0.5">{s.label}</div>
                  <div className="text-muted-foreground text-xs font-body">{s.desc}</div>
                </div>
              </SelectableCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[480px]">
        <div className="flex justify-between items-center mb-5">
          <Logo />
          <GhostButton onClick={onBack} className="text-xs px-2.5 py-1">← Home</GhostButton>
        </div>

        {step === 0 && (
          <div className="animate-fade-in">
            <p className="text-primary font-display text-xs tracking-[2px] uppercase mb-1">Step 1 of 3</p>
            <h2 className="font-display text-xl font-bold text-foreground mb-1">Which accent?</h2>
            <p className="text-muted-foreground text-sm mb-4">Choose the English you want to sound like.</p>
            <div className="flex flex-col gap-2 mb-5">
              {ACCENTS.map(a => (
                <SelectableCard key={a.id} selected={accentId === a.id} onClick={() => setAccentId(a.id)}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="text-3xl">{a.flag}</span>
                    <span className="font-display font-semibold text-foreground">{a.label} English</span>
                    {accentId === a.id && <span className="ml-auto text-primary">✓</span>}
                  </div>
                </SelectableCard>
              ))}
            </div>
            <GoldButton disabled={!accentId} onClick={() => setStep(1)} className="w-full">Next →</GoldButton>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <p className="text-primary font-display text-xs tracking-[2px] uppercase mb-1">Step 2 of 3</p>
            <h2 className="font-display text-xl font-bold text-foreground mb-1">Choose a voice</h2>
            <p className="text-muted-foreground text-sm mb-4">Tap Preview to hear any voice before choosing.</p>

            <div className="flex flex-col gap-2 mb-4">
              <div className="flex gap-2">
                {([["female", "Woman"], ["male", "Man"]] as const).map(([g, lb]) => {
                  const firstVoiceId = accentObj?.[g]?.[0]?.id || null;
                  return (
                    <button
                      key={g}
                      onClick={() => { setGender(g); setVoiceId(firstVoiceId); }}
                      className={`flex-1 flex flex-col items-center gap-1.5 p-5 rounded-lg border transition-all ${
                        gender === g ? "border-primary bg-navy-hover shadow-[0_0_0_2px_hsl(var(--gold)/0.22)] cursor-pointer" : "border-border bg-card hover:border-primary cursor-pointer"
                      }`}
                    >
                      <div className="w-[54px] h-[54px] rounded-full overflow-hidden flex-shrink-0 border-2"
                        style={{ borderColor: gender === g ? "hsl(var(--gold))" : "hsl(var(--border))", background: "hsl(var(--navy-mid))" }}>
                        <AvatarImg voiceId={firstVoiceId} gender={g} size={54} />
                      </div>
                      <span className={`font-display font-semibold ${gender === g ? "text-foreground" : "text-muted-foreground"}`}>{lb}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {gender && accVoices.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {accVoices.map(v => {
                  const ps = previewSt[v.id] || "idle";
                  return (
                    <div
                      key={v.id}
                      onClick={() => setVoiceId(v.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        voiceId === v.id ? "border-primary bg-navy-hover shadow-[0_0_0_2px_hsl(var(--gold)/0.2)]" : "border-border bg-card hover:border-primary"
                      }`}
                    >
                      <div className="w-[38px] h-[38px] rounded-full overflow-hidden flex-shrink-0 border-2"
                        style={{ borderColor: voiceId === v.id ? "hsl(var(--gold))" : "hsl(var(--border))" }}>
                        <AvatarImg voiceId={v.id} gender={gender} size={38} />
                      </div>
                      <div className="flex-1">
                        <div className="font-display font-semibold text-foreground">{v.name}</div>
                        <div className="text-muted-foreground text-xs">{v.desc}</div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setVoiceId(v.id); previewVoice(v.id); }}
                        className="bg-transparent border border-gold-border rounded-lg px-2 py-0.5 cursor-pointer text-primary text-xs flex items-center gap-1 flex-shrink-0"
                      >
                        {ps === "loading" ? <><Spinner size={11} /> Loading...</> :
                         ps === "playing" ? <><WaveBars active className="h-[11px]" /> Stop</> :
                         <><svg width="8" height="8" viewBox="0 0 24 24" fill="hsl(var(--gold))"><polygon points="5 3 19 12 5 21 5 3" /></svg> Preview</>}
                      </button>
                      {voiceId === v.id && <span className="text-primary text-xs flex-shrink-0">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2">
              <GhostButton onClick={() => setStep(0)}>← Back</GhostButton>
              <GoldButton disabled={!voiceId} onClick={() => setStep(2)} className="flex-1">Next →</GoldButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <p className="text-primary font-display text-xs tracking-[2px] uppercase mb-1">Step 3 of 3</p>
            <h2 className="font-display text-xl font-bold text-foreground mb-1">Practice mode</h2>
            <p className="text-muted-foreground text-sm mb-4">How do you want to train today?</p>
            <div className="flex flex-col gap-2 mb-5">
              {MODES.map(m => (
                <SelectableCard key={m.id} selected={mode === m.id} onClick={() => setMode(m.id)}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="text-2xl">{m.emoji}</span>
                    <div>
                      <div className="font-display font-semibold text-foreground">{m.label}</div>
                      <div className="text-muted-foreground text-xs font-body">{m.desc}</div>
                    </div>
                    {mode === m.id && <span className="ml-auto text-primary">✓</span>}
                  </div>
                </SelectableCard>
              ))}
            </div>
            <div className="flex gap-2">
              <GhostButton onClick={() => setStep(1)}>← Back</GhostButton>
              <GoldButton onClick={() => setShowScenarios(true)} className="flex-1">Choose Scenario →</GoldButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
