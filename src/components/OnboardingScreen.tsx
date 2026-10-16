import { useState, forwardRef } from "react";
import { Logo, GoldButton, GhostButton, SelectableCard } from "@/components/NativeTalkUI";
import { LEVELS, GOALS, FEARS, type UserProfile } from "@/lib/constants";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingScreen = forwardRef<HTMLDivElement, OnboardingProps>(({ onComplete }, ref) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", job: "", goal: "", fear: "" });
  const [level, setLevel] = useState<string | null>(null);

  const steps = [
    {
      emoji: "👋",
      q: "Welcome! What's your name?",
      sub: "I'll use it throughout our sessions.",
      ok: !!data.name.trim(),
      next: () => setStep(1),
    },
    {
      emoji: "💼",
      q: `Nice to meet you, ${data.name}! What do you do?`,
      sub: "I'll make every conversation relevant to your real life.",
      ok: !!data.job.trim(),
      next: () => setStep(2),
    },
    {
      emoji: "🎯",
      q: "What's your biggest English dream?",
      sub: "Pick the one that matters most right now.",
      ok: !!data.goal,
      next: () => setStep(3),
    },
    {
      emoji: "😰",
      q: "What worries you most about speaking English?",
      sub: "Be honest — I'll help you face it head on.",
      ok: !!data.fear,
      next: () => setStep(4),
    },
    {
      emoji: "🌱",
      q: "What's your current level?",
      sub: "I'll always speak at exactly the right speed for you.",
      ok: !!level,
      next: () => onComplete({ ...data, level: level || "intermediate", onboarded: true }),
      nextLabel: "Let's start! 🚀",
    },
  ];

  const s = steps[step];

  return (
    <div ref={ref} className="min-h-screen bg-background flex items-center justify-center p-6 font-body text-foreground">
      <div className="w-full max-w-[450px] animate-fade-in">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-[7px] rounded transition-all"
              style={{
                width: i === step ? 22 : 7,
                background: i <= step ? "hsl(var(--gold))" : "hsl(var(--border))",
              }}
            />
          ))}
        </div>

        {/* Question */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-1">{s.emoji}</div>
          <h2 className="font-display text-2xl font-bold mb-1 leading-tight text-foreground">{s.q}</h2>
          <p className="text-muted-foreground text-sm font-body">{s.sub}</p>
        </div>

        {/* Body */}
        <div className="mb-5">
          {step === 0 && (
            <input
              autoFocus
              placeholder="Your first name…"
              value={data.name}
              onChange={e => setData(d => ({ ...d, name: e.target.value }))}
              onKeyDown={e => { if (e.key === "Enter" && data.name.trim()) setStep(1); }}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground font-body text-sm outline-none transition-colors focus:border-primary placeholder:text-border"
            />
          )}
          {step === 1 && (
            <input
              autoFocus
              placeholder="e.g. nurse, engineer, student, manager…"
              value={data.job}
              onChange={e => setData(d => ({ ...d, job: e.target.value }))}
              onKeyDown={e => { if (e.key === "Enter" && data.job.trim()) setStep(2); }}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground font-body text-sm outline-none transition-colors focus:border-primary placeholder:text-border"
            />
          )}
          {step === 2 && (
            <div className="flex flex-col gap-2">
              {GOALS.map(g => (
                <SelectableCard key={g} selected={data.goal === g} onClick={() => setData(d => ({ ...d, goal: g }))}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className={`font-body text-sm flex-1 ${data.goal === g ? "text-foreground" : "text-muted-foreground"}`}>{g}</span>
                    {data.goal === g && <span className="text-primary">✓</span>}
                  </div>
                </SelectableCard>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-2">
              {FEARS.map(f => (
                <SelectableCard key={f} selected={data.fear === f} onClick={() => setData(d => ({ ...d, fear: f }))}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className={`font-body text-sm flex-1 ${data.fear === f ? "text-foreground" : "text-muted-foreground"}`}>{f}</span>
                    {data.fear === f && <span className="text-primary">✓</span>}
                  </div>
                </SelectableCard>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col gap-2">
              {LEVELS.map(l => (
                <SelectableCard key={l.id} selected={level === l.id} onClick={() => setLevel(l.id)}>
                  <div className="flex items-center gap-3 px-4 py-4">
                    <span className="text-2xl">{l.emoji}</span>
                    <div>
                      <div className="font-display font-semibold text-foreground">{l.label}</div>
                      <div className="text-muted-foreground text-xs font-body">{l.desc}</div>
                    </div>
                    {level === l.id && <span className="ml-auto text-primary">✓</span>}
                  </div>
                </SelectableCard>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          {step > 0 && <GhostButton onClick={() => setStep(step - 1)}>← Back</GhostButton>}
          <GoldButton disabled={!s.ok} onClick={s.next} className="flex-1">
            {s.nextLabel || "Next →"}
          </GoldButton>
        </div>
      </div>
    </div>
  );
});
OnboardingScreen.displayName = "OnboardingScreen";
export default OnboardingScreen;
