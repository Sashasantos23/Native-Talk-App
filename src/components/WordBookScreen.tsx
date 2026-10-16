import { Logo, GhostButton, BottomNav } from "@/components/NativeTalkUI";
import { type WordEntry, SCENARIOS } from "@/lib/constants";

interface WordBookScreenProps {
  wordBook: WordEntry[];
  onNavigate: (screen: string) => void;
}

export default function WordBookScreen({ wordBook, onNavigate }: WordBookScreenProps) {
  return (
    <div className="min-h-screen bg-background font-body text-foreground pb-20">
      <div className="max-w-[540px] mx-auto px-4 py-5">
        <div className="flex justify-between items-center mb-5">
          <Logo />
          <GhostButton onClick={() => onNavigate("home")} className="text-xs px-2.5 py-1">← Home</GhostButton>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-xl font-bold text-foreground">📓 Word Book</h2>
          <span className="bg-gold-soft border border-gold-border rounded-lg px-2 py-0.5 text-xs text-primary font-body">
            {wordBook.length} saved
          </span>
        </div>

        {wordBook.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">📓</div>
            <p className="font-display text-muted-foreground mb-1">Your word book is empty</p>
            <p className="text-sm text-muted-foreground">Coach tips from sessions are saved here automatically.</p>
          </div>
        ) : (
          wordBook.map((w, i) => {
            const sc = SCENARIOS.find(s => s.id === w.scenario);
            return (
              <div
                key={w.id || i}
                className="bg-card border border-border border-l-[3px] border-l-primary rounded-xl p-3.5 mb-2"
              >
                <p className="text-sm leading-relaxed text-cream-mid mb-1">💡 {w.tip}</p>
                <p className="text-[0.67rem] text-muted-foreground">
                  {sc && `${sc.emoji} ${sc.label} · `}
                  {new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            );
          })
        )}
      </div>

      <BottomNav currentScreen="wordbook" onNavigate={onNavigate} />
    </div>
  );
}
