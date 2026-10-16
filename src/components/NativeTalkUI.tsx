import { useState, forwardRef } from "react";
import { browserSpeakSync, stopSpeaking, speakText } from "@/lib/tts";

export function WaveBars({ active, className = "" }: { active: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 h-[18px] ${className}`}>
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className="inline-block w-[3px] rounded-sm bg-primary"
          style={{
            opacity: active ? 1 : 0.25,
            height: active ? undefined : 4,
            animation: active ? `wv .85s ${i * 0.13}s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
    </span>
  );
}

export function Spinner({ size = 12 }: { size?: number }) {
  return (
    <span
      className="inline-block border-2 border-primary border-t-transparent rounded-full animate-spin-custom"
      style={{ width: size, height: size }}
    />
  );
}

export function LoadingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-[7px] h-[7px] rounded-full bg-primary animate-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

export function ListenButton({
  text,
  gender,
  speed,
  voiceId,
}: {
  text: string;
  gender: string;
  speed: number;
  voiceId?: string;
}) {
  const [playing, setPlaying] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    stopSpeaking();
    setPlaying(true);
    speakText(text, voiceId, gender, speed, () => setPlaying(true), () => setPlaying(false));
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-lg border transition-all text-xs font-body"
      style={{
        background: playing ? "hsl(var(--gold-soft))" : "hsl(var(--gold) / 0.06)",
        borderColor: playing ? "hsl(var(--gold-border))" : "hsl(var(--gold) / 0.18)",
        color: "hsl(var(--gold))",
      }}
    >
      {playing ? (
        <WaveBars active className="h-[13px]" />
      ) : (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      )}
      <span>{playing ? "Stop" : "Listen"}</span>
    </button>
  );
}

export const Logo = forwardRef<HTMLDivElement, { size?: "md" | "lg" }>(({ size = "md" }, ref) => {
  const big = size === "lg";
  return (
    <div ref={ref} className="flex items-center justify-center" style={{ gap: big ? ".6rem" : ".45rem" }}>
      <div
        className="flex items-center justify-center flex-shrink-0 rounded-xl border-2 border-primary"
        style={{
          width: big ? 44 : 32,
          height: big ? 44 : 32,
          borderRadius: big ? 12 : 9,
          background: "linear-gradient(135deg, hsl(var(--navy)), hsl(var(--navy-light)))",
          boxShadow: "0 0 12px hsl(var(--gold) / 0.25)",
        }}
      >
        <svg width={big ? 22 : 16} height={big ? 22 : 16} viewBox="0 0 24 24" fill="none">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" fill="hsl(var(--gold))" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="hsl(var(--gold))" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="19" x2="12" y2="22" stroke="hsl(var(--gold))" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="22" x2="16" y2="22" stroke="hsl(var(--gold))" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <span className="font-display font-bold" style={{ fontSize: big ? "1.55rem" : "1.05rem", letterSpacing: "-.3px" }}>
          <span className="text-foreground">Native</span>
          <span className="text-primary">Talk</span>
        </span>
        {big && (
          <div className="text-muted-foreground uppercase tracking-[2px]" style={{ fontSize: ".63rem", marginTop: 1 }}>
            Speak like a native
          </div>
        )}
      </div>
    </div>
  );
});
Logo.displayName = "Logo";

export const GhostButton = forwardRef<HTMLButtonElement, {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}>(({ children, onClick, className = "" }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`bg-transparent text-muted-foreground border border-border rounded-lg px-3.5 py-1.5 text-sm cursor-pointer transition-all hover:border-primary hover:text-primary font-body ${className}`}
    >
      {children}
    </button>
  );
});
GhostButton.displayName = "GhostButton";

export const GoldButton = forwardRef<HTMLButtonElement, {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}>(({ children, onClick, disabled = false, className = "" }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={`font-display font-bold text-primary-foreground border-none rounded-xl px-7 py-3.5 text-[0.95rem] cursor-pointer tracking-wide transition-all hover:-translate-y-px disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${className}`}
      style={{
        background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light)))",
        boxShadow: disabled ? "none" : undefined,
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.target as HTMLElement).style.boxShadow = "0 6px 22px hsl(var(--gold) / 0.35)";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLElement).style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
});
GoldButton.displayName = "GoldButton";

export function SelectableCard({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-card border rounded-lg cursor-pointer transition-all hover:bg-navy-hover hover:border-primary ${
        selected ? "border-primary bg-navy-hover shadow-[0_0_0_2px_hsl(var(--gold)/0.22)]" : "border-border"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function BottomNav({
  currentScreen,
  onNavigate,
}: {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}) {
  const items = [
    { id: "home", emoji: "🏠", label: "Home" },
    { id: "setup", emoji: "🗣️", label: "Practice" },
    { id: "wordbook", emoji: "📓", label: "Words" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-1 flex justify-center">
      <div className="max-w-[540px] w-full flex justify-around">
        {items.map(({ id, emoji, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`bg-transparent border-none cursor-pointer p-1.5 rounded-lg font-body text-[0.72rem] flex flex-col items-center gap-0.5 transition-all ${
              currentScreen === id ? "text-primary bg-gold-soft" : "text-border hover:text-primary"
            }`}
          >
            <span className="text-lg">{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
