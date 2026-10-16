import { useState, useEffect } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";

// Avatar config per voice — used with DiceBear npm package (fully client-side)
export const VOICE_AVATAR_SEEDS: Record<string, {
  seed: string; skinColor: string; top: string; hairColor: string;
  facialHairType: string; clotheType: string; eyeType: string; mouthType: string;
}> = {
  // American Female
  "EXAVITQu4vr4xnSDxMaL": { seed:"sarah",    skinColor:"light",     top:"longHairStraight",           hairColor:"brownDark",    facialHairType:"",            clotheType:"blazerSweater",  eyeType:"happy",    mouthType:"smile"   },
  "cgSgspJ2msm6clMCkdW9": { seed:"jessica",   skinColor:"pale",      top:"longHairCurvy",              hairColor:"blondeGolden", facialHairType:"",            clotheType:"shirtScoopNeck", eyeType:"winkWacky",mouthType:"smile"   },
  // American Male
  "cjVigY5qzO86Huf0OWal": { seed:"eric",      skinColor:"tanned",    top:"shortHairShortWaved",        hairColor:"brown",        facialHairType:"",            clotheType:"hoodie",         eyeType:"default",  mouthType:"default" },
  "nPczCjzI2devNBz1zQrb": { seed:"brian",     skinColor:"darkBrown", top:"shortHairShortFlat",         hairColor:"black",        facialHairType:"beardLight",  clotheType:"blazerShirt",    eyeType:"default",  mouthType:"serious" },
  // British Female
  "pFZP5JQG7iQjIQuC4Bku": { seed:"lily",      skinColor:"light",     top:"longHairCurly",              hairColor:"auburn",       facialHairType:"",            clotheType:"blazerSweater",  eyeType:"default",  mouthType:"smile"   },
  "Xb7hH8MSUJpSbSDYk0k2": { seed:"alice",     skinColor:"black",     top:"longHairFro",                hairColor:"black",        facialHairType:"",            clotheType:"collarSweater",  eyeType:"happy",    mouthType:"smile"   },
  // British Male
  "onwK4e9ZLuTAKqWW03F9": { seed:"daniel",    skinColor:"pale",      top:"shortHairTheCaesarSidePart", hairColor:"black",        facialHairType:"",            clotheType:"blazerShirt",    eyeType:"default",  mouthType:"serious" },
  "JBFqnCBsd6RMkjVDRZzb": { seed:"george",    skinColor:"brown",     top:"shortHairShortCurly",        hairColor:"brownDark",    facialHairType:"",            clotheType:"shirtCrewNeck",  eyeType:"happy",    mouthType:"smile"   },
  // Australian Female
  "e1nbKcfTL4XYy71tZn9J": { seed:"kylie",     skinColor:"tanned",    top:"longHairNotTooLong",         hairColor:"black",        facialHairType:"",            clotheType:"shirtScoopNeck", eyeType:"default",  mouthType:"smile"   },
  "M7ya1YbaeFaPXljg9BpK": { seed:"hannah",    skinColor:"light",     top:"longHairBigHair",            hairColor:"blonde",       facialHairType:"",            clotheType:"shirtVNeck",     eyeType:"happy",    mouthType:"twinkle" },
  // Australian Male
  "pqHfZKP75CvOlQylNhV4": { seed:"bill",      skinColor:"tanned",    top:"shortHairShortRound",        hairColor:"blondeGolden", facialHairType:"beardMedium", clotheType:"shirtCrewNeck",  eyeType:"default",  mouthType:"default" },
  "IKne3meq5aSn9XLyUdCD": { seed:"charlie",   skinColor:"mellow",    top:"shortHairDreads01",          hairColor:"black",        facialHairType:"moustacheMagnum", clotheType:"hoodie",     eyeType:"default",  mouthType:"default" },
};

// Cache generated data URIs to avoid re-generating
const avatarCache = new Map<string, string>();

function getCacheKey(voiceId: string | null, gender: string | null) {
  return `${voiceId || "none"}-${gender || "none"}`;
}

export default function AvatarImg({
  voiceId,
  gender,
  size = 54,
}: {
  voiceId: string | null;
  gender: string | null;
  size?: number;
}) {
  const cacheKey = getCacheKey(voiceId, gender);
  const [svgSrc, setSvgSrc] = useState<string | null>(avatarCache.get(cacheKey) || null);

  useEffect(() => {
    const key = getCacheKey(voiceId, gender);
    if (avatarCache.has(key)) {
      setSvgSrc(avatarCache.get(key)!);
      return;
    }

    let cancelled = false;

    const cfg = (voiceId && VOICE_AVATAR_SEEDS[voiceId]) || (
      gender === "male"
        ? { seed: "male-default", skinColor: "light", top: "shortHairShortFlat", hairColor: "brown", facialHairType: "", clotheType: "shirtCrewNeck", eyeType: "default", mouthType: "default" }
        : { seed: "female-default", skinColor: "light", top: "longHairStraight", hairColor: "brownDark", facialHairType: "", clotheType: "shirtScoopNeck", eyeType: "happy", mouthType: "smile" }
    );

    const avatar = createAvatar(avataaars, {
      seed: cfg.seed,
      backgroundColor: ["111f63"],
      skinColor: [cfg.skinColor],
      top: [cfg.top],
      hairColor: [cfg.hairColor],
      ...(cfg.facialHairType ? { facialHair: [cfg.facialHairType] } : {}),
      ...(cfg.eyeType ? { eyes: [cfg.eyeType] } : {}),
      ...(cfg.mouthType ? { mouth: [cfg.mouthType] } : {}),
    } as any);

    const dataUri = avatar.toDataUri();
    if (!cancelled) {
      avatarCache.set(key, dataUri);
      setSvgSrc(dataUri);
    }

    return () => { cancelled = true; };
  }, [voiceId, gender]);

  if (!svgSrc) {
    const initial = (voiceId && VOICE_AVATAR_SEEDS[voiceId]?.seed || (gender === "male" ? "M" : "F"))
      .charAt(0).toUpperCase();
    return (
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0 text-primary font-display font-bold"
        style={{
          width: size,
          height: size,
          background: "hsl(var(--navy-mid))",
          fontSize: size * 0.4,
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={svgSrc}
      alt=""
      width={size}
      height={size}
      className="rounded-full object-cover block flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
