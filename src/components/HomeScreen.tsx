import { Logo, GhostButton, GoldButton, LoadingDots, BottomNav } from "@/components/NativeTalkUI";
import { type UserProfile, type WordEntry, type SessionEntry, SCENARIOS } from "@/lib/constants";

interface HomeScreenProps {
  profile: UserProfile;
  wordBook: WordEntry[];
  sessions: SessionEntry[];
  streak: number;
  mission: string | null;
  onStartPractice: () => void;
  onEditProfile: () => void;
  onNavigate: (screen: string) => void;
}

export default function HomeScreen({
  profile,
  wordBook,
  sessions,
  streak,
  mission,
  onStartPractice,
  onEditProfile,
  onNavigate,
}: HomeScreenProps) {
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const totalSessions = sessions.length;
  const weekSessions = sessions.filter(s => (Date.now() - new Date(s.date).getTime()) / 864e5 < 7).length;

  const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5).toDateString();
    return sessions.filter(s => new Date(s.date).toDateString() === d).length;
  });
  const maxDay = Math.max(...last7, 1);

  return (
    <div className="min-h-screen bg-background font-body text-foreground pb-20">
      <div className="max-w-[540px] mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <Logo />
          <GhostButton onClick={onEditProfile} className="text-xs px-2.5 py-1">Edit Profile</GhostButton>
        </div>

        <p className="text-muted-foreground text-sm mb-0.5">{greet} 👋</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-4">{profile.name}</h1>

        {/* Goal card */}
        <div className="rounded-lg p-4 mb-3 border-l-4 border-l-primary" style={{
          background: "linear-gradient(135deg, hsl(var(--navy)), hsl(var(--navy-mid)))",
          borderTop: "1px solid hsl(var(--border))",
          borderRight: "1px solid hsl(var(--border))",
          borderBottom: "1px solid hsl(var(--border))",
        }}>
          <p className="text-primary text-[0.67rem] tracking-[1.8px] uppercase mb-1">🎯 Your goal</p>
          <p className="font-display font-semibold text-foreground">{profile.goal}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { v: `${streak}🔥`, l: "Day streak" },
            { v: totalSessions, l: "Sessions" },
            { v: wordBook.length, l: "Words saved" },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="font-display text-xl font-bold text-primary">{s.v}</div>
              <div className="text-[0.67rem] text-muted-foreground mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Weekly chart */}
        <div className="bg-card border border-border rounded-lg p-4 mb-3">
          <p className="text-primary text-[0.67rem] tracking-[1.8px] uppercase mb-3">
            📊 This week — {weekSessions} session{weekSessions !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-1 items-end h-12">
            {last7.map((n, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary rounded-sm transition-all duration-500"
                  style={{
                    opacity: n > 0 ? 0.85 : 0.12,
                    height: `${Math.max(3, (n / maxDay) * 36)}px`,
                  }}
                />
                <span className="text-[0.58rem] text-muted-foreground">
                  {DAYS[(new Date().getDay() - 6 + i + 7) % 7]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="bg-card border border-border border-l-4 border-l-destructive rounded-lg p-4 mb-3">
          <p className="text-destructive text-[0.67rem] tracking-[1.8px] uppercase mb-1.5">⚡ Today's mission</p>
          {mission ? (
            <p className="font-body text-sm leading-relaxed text-cream-mid">{mission}</p>
          ) : (
            <LoadingDots />
          )}
        </div>

        {/* Word Book preview */}
        {wordBook.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-4 mb-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-primary text-[0.67rem] tracking-[1.8px] uppercase">📓 Word Book</p>
              <button
                onClick={() => onNavigate("wordbook")}
                className="bg-transparent border-none text-muted-foreground text-xs cursor-pointer font-body hover:text-primary"
              >
                See all →
              </button>
            </div>
            {wordBook.slice(0, 2).map((w, i) => (
              <div key={i} className="bg-background rounded-lg px-3 py-2 mb-1 last:mb-0">
                <p className="text-xs text-cream-mid leading-relaxed">💡 {w.tip}</p>
              </div>
            ))}
          </div>
        )}

        <GoldButton onClick={onStartPractice} className="w-full py-3.5 text-base">
          Start Practicing →
        </GoldButton>
      </div>

      <BottomNav currentScreen="home" onNavigate={onNavigate} />
    </div>
  );
}
