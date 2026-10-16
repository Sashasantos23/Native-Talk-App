import React from "react";

export function formatCoachTip(tip: string): React.ReactNode {
  if (!tip) return null;

  const quoteRegex = /["""''']([^"""''']{1,60})["""''']/g;
  const quotes: { text: string; index: number; full: string }[] = [];
  let m;
  while ((m = quoteRegex.exec(tip)) !== null) {
    quotes.push({ text: m[1], index: m.index, full: m[0] });
  }

  if (quotes.length < 2) {
    return <span>{tip}</span>;
  }

  const wrong = quotes[0];
  const correct = quotes[1];

  const parts: { type: "plain" | "wrong" | "correct"; text: string }[] = [];
  let cursor = 0;

  if (wrong.index > cursor) {
    parts.push({ type: "plain", text: tip.slice(cursor, wrong.index) });
  }
  parts.push({ type: "wrong", text: wrong.text });
  cursor = wrong.index + wrong.full.length;

  if (correct.index > cursor) {
    parts.push({ type: "plain", text: tip.slice(cursor, correct.index) });
  }
  parts.push({ type: "correct", text: correct.text });
  cursor = correct.index + correct.full.length;

  if (cursor < tip.length) {
    parts.push({ type: "plain", text: tip.slice(cursor) });
  }

  return (
    <>
      {parts.map((p, i) => {
        if (p.type === "wrong") {
          return (
            <span key={i} style={{ color: "#e05555", textDecoration: "line-through", fontWeight: 600 }}>
              {p.text}
            </span>
          );
        }
        if (p.type === "correct") {
          return (
            <span key={i} style={{ color: "#4caf7d", fontWeight: 700 }}>
              {p.text}
            </span>
          );
        }
        return <span key={i}>{p.text}</span>;
      })}
    </>
  );
}
