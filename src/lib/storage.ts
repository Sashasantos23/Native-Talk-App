// Storage helpers using localStorage

export const load = <T>(key: string): T | null => {
  try {
    const val = localStorage.getItem(`nativetalk_${key}`);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

export const save = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(`nativetalk_${key}`, JSON.stringify(val));
  } catch {}
};

export const parseTag = (txt: string, tag: string): string | null => {
  const m = txt.match(new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, "i"));
  return m ? m[1].trim() : null;
};

export const stripTags = (txt: string): string =>
  txt
    .replace(/\[COACH\][\s\S]*?\[\/COACH\]/gi, "")
    .replace(/\[SHADOW\][\s\S]*?\[\/SHADOW\]/gi, "")
    .replace(/\[TRY\][\s\S]*?\[\/TRY\]/gi, "")
    .replace(/\[PT\][\s\S]*?\[\/PT\]/gi, "")
    .trim();

export const parsePT = (txt: string): string | null => {
  const m = txt.match(/\[PT\]([\s\S]*?)\[\/PT\]/i);
  return m ? m[1].trim() : null;
};

export interface TryPhrase {
  english: string;
  pt: string | null;
}

export const parseTry = (txt: string): TryPhrase[] => {
  const m = txt.match(/\[TRY\]([\s\S]*?)\[\/TRY\]/i);
  if (!m) return [];
  return m[1]
    .split("·")
    .map(s => {
      const clean = s.trim().replace(/^["""\u201c\u201d''']|["""\u201c\u201d''']$/g, "").trim();
      const parts = clean.split("|");
      return {
        english: parts[0]?.trim() || clean,
        pt: parts[1]?.trim() || null,
      };
    })
    .filter(p => p.english);
};
