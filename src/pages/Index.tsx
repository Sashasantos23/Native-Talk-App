import { useState, useEffect, useCallback, useRef } from "react";
import { Logo, LoadingDots } from "@/components/NativeTalkUI";
import OnboardingScreen from "@/components/OnboardingScreen";
import HomeScreen from "@/components/HomeScreen";
import SetupScreen from "@/components/SetupScreen";
import WordBookScreen from "@/components/WordBookScreen";
import ChatScreen from "@/components/ChatScreen";
import { load, save, parseTag, stripTags, parseTry, parsePT, type TryPhrase } from "@/lib/storage";
import { callAI, buildPrompt, generateFeedback, generateMission } from "@/lib/ai";
import { stopSpeaking, speakText } from "@/lib/tts";
import {
  type UserProfile, type WordEntry, type SessionEntry, type ChatMessage,
  SPEECH_RATE,
} from "@/lib/constants";

type Screen = "loading" | "onboarding" | "home" | "setup" | "chat" | "wordbook";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("loading");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [level, setLevel] = useState("intermediate");
  const [accentId, setAccentId] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [mode, setMode] = useState("normal");
  const [scenario, setScenario] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wordBook, setWordBook] = useState<WordEntry[]>([]);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [mission, setMission] = useState<string | null>(null);
  const [coachMap, setCoachMap] = useState<Record<number, string>>({});
  const [shadowLine, setShadowLine] = useState<string | null>(null);
  const [tryPhrases, setTryPhrases] = useState<TryPhrase[]>([]);
  const [ptMap, setPtMap] = useState<Record<number, string>>({});
  const prevMsgCountRef = useRef(0);
  const [timerSignal, setTimerSignal] = useState(0);

  // Speak AI reply, with optional onEnd callback
  const speakReply = useCallback((text: string, onEnd?: () => void) => {
    if (!voiceId) {
      onEnd?.();
      return;
    }
    const rate = SPEECH_RATE[level] || 0.95;
    speakText(text, voiceId, gender || "female", rate, undefined, onEnd);
  }, [voiceId, gender, level]);

  // Boot
  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
    const p = load<UserProfile>("profile");
    const wb = load<WordEntry[]>("wordbook");
    const ss = load<SessionEntry[]>("sessions");
    const sk = load<{ count: number }>("streak");
    if (wb) setWordBook(wb);
    if (ss) setSessions(ss);
    if (sk) setStreak(sk.count || 0);
    if (p?.onboarded) {
      setProfile(p);
      setLevel(p.level || "intermediate");
      setScreen("home");
    } else {
      setScreen("onboarding");
    }
  }, []);

  // Generate mission on home
  useEffect(() => {
    if (screen === "home" && profile && !mission) {
      generateMission(profile).then(setMission);
    }
  }, [screen, profile, mission]);

  const saveWord = useCallback((tip: string) => {
    const entry: WordEntry = { tip, date: new Date().toISOString(), scenario: scenario || "", id: Date.now() };
    setWordBook(prev => { const u = [entry, ...prev].slice(0, 60); save("wordbook", u); return u; });
  }, [scenario]);

  const saveSession = useCallback(() => {
    if (!scenario) return;
    const entry: SessionEntry = {
      date: new Date().toISOString(), scenario, level, mode,
      msgs: messages.filter(m => m.role === "user" && m.content !== "Begin the scenario.").length,
    };
    setSessions(prev => { const u = [entry, ...prev].slice(0, 200); save("sessions", u); return u; });
    const today = new Date().toDateString();
    const sk = load<{ lastDate: string; count: number }>("streak");
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newCount = sk?.lastDate === today ? sk.count : sk?.lastDate === yesterday ? (sk.count || 0) + 1 : 1;
    setStreak(newCount);
    save("streak", { lastDate: today, count: newCount });
  }, [scenario, level, mode, messages]);

  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p);
    setLevel(p.level || "intermediate");
    save("profile", p);
    save("streak", { lastDate: "", count: 0 });
    setScreen("home");
    generateMission(p).then(setMission);
  };

  const startChat = async (sc: string) => {
    setScenario(sc);
    setScreen("chat");
    setMessages([]);
    setLoading(true);
    setFeedback(null);
    setShowFeedback(false);
    setShadowLine(null);
    setCoachMap({});
    setTryPhrases([]);
    setPtMap({});

    // Pause timer while AI generates opening
    if (mode === "pressure") {
      setTimerSignal(0);
    }

    try {
      const systemPrompt = buildPrompt(profile!, level, sc, mode);
      const openingMsg: ChatMessage = { role: "user", content: "Begin the scenario." };
      const raw = await callAI([openingMsg], systemPrompt, sc);
      const coach = parseTag(raw, "COACH");
      const shadow = parseTag(raw, "SHADOW");
      const tries = parseTry(raw);
      const pt = parsePT(raw);
      const clean = stripTags(raw);
      setMessages([openingMsg, { role: "assistant", content: clean }]);
      if (coach) { setCoachMap({ 1: coach }); saveWord(coach); }
      if (shadow) setShadowLine(shadow);
      if (tries.length) setTryPhrases(tries); else setTryPhrases([]);
      if (pt) setPtMap({ 1: pt });
      speakReply(clean, () => {
        if (mode === "pressure") setTimerSignal(s => s + 1);
      });
    } catch {
      const openingMsg: ChatMessage = { role: "user", content: "Begin the scenario." };
      const fallback = "Hello! Ready to practice. Let's begin!";
      setMessages([openingMsg, { role: "assistant", content: fallback }]);
      speakReply(fallback, () => {
        if (mode === "pressure") setTimerSignal(s => s + 1);
      });
    }
    setLoading(false);
  };

  const sendMessage = async (txt: string) => {
    setShadowLine(null);
    setTryPhrases([]);
    const newMsgs: ChatMessage[] = [...messages, { role: "user", content: txt }];
    setMessages(newMsgs);
    setLoading(true);
    setShowFeedback(false);

    try {
      const systemPrompt = buildPrompt(profile!, level, scenario || "smalltalk", mode);
      const raw = await callAI(newMsgs, systemPrompt, scenario || "smalltalk");
      const coach = parseTag(raw, "COACH");
      const shadow = parseTag(raw, "SHADOW");
      const tries = parseTry(raw);
      const pt = parsePT(raw);
      const clean = stripTags(raw);
      const idx = newMsgs.length;
      setMessages([...newMsgs, { role: "assistant", content: clean }]);
      if (coach) { setCoachMap(m => ({ ...m, [idx]: coach })); saveWord(coach); }
      if (shadow) setShadowLine(shadow);
      if (tries.length) setTryPhrases(tries); else setTryPhrases([]);
      if (pt) setPtMap(prev => ({ ...prev, [idx]: pt }));
      speakReply(clean, () => {
        if (mode === "pressure") setTimerSignal(s => s + 1);
      });
    } catch {
      const fallback = "Sorry, trouble responding. Try again!";
      setMessages(m => [...m, { role: "assistant", content: fallback }]);
      speakReply(fallback, () => {
        if (mode === "pressure") setTimerSignal(s => s + 1);
      });
    }
    setLoading(false);
  };

  const getFeedback = async () => {
    const feedbackMessages = messages.filter(
      m => !(m.role === "user" && m.content === "Begin the scenario.")
    );
    if (feedbackMessages.length < 2) return;
    setShowFeedback(true);
    setFeedback(null);
    saveSession();
    try {
      const f = await generateFeedback(feedbackMessages, profile?.name || "Student", profile?.goal || "");
      setFeedback(f);
    } catch {
      setFeedback("Great effort! Keep practicing every day — you're building real confidence.");
    }
  };

  const exitChat = () => {
    saveSession();
    stopSpeaking();
    setScreen("home");
    setMessages([]);
    setFeedback(null);
    setShowFeedback(false);
    setShadowLine(null);
    setCoachMap({});
    setTryPhrases([]);
    setPtMap({});
  };

  const navigate = (s: string) => {
    if (s === "setup") setScreen("setup");
    else if (s === "wordbook") setScreen("wordbook");
    else setScreen("home");
  };

  // Loading
  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-5">
        <Logo size="lg" />
        <LoadingDots />
      </div>
    );
  }

  if (screen === "onboarding") {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (screen === "home" && profile) {
    return (
      <HomeScreen
        profile={profile}
        wordBook={wordBook}
        sessions={sessions}
        streak={streak}
        mission={mission}
        onStartPractice={() => setScreen("setup")}
        onEditProfile={() => setScreen("onboarding")}
        onNavigate={navigate}
      />
    );
  }

  if (screen === "setup") {
    return (
      <SetupScreen
        onStartChat={startChat}
        onBack={() => setScreen("home")}
        accentId={accentId}
        setAccentId={setAccentId}
        gender={gender}
        setGender={setGender}
        voiceId={voiceId}
        setVoiceId={setVoiceId}
        mode={mode}
        setMode={setMode}
      />
    );
  }

  if (screen === "wordbook") {
    return <WordBookScreen wordBook={wordBook} onNavigate={navigate} />;
  }

  if (screen === "chat" && profile && scenario) {
    return (
      <ChatScreen
        profile={profile}
        level={level}
        scenario={scenario}
        mode={mode}
        gender={gender || "female"}
        voiceId={voiceId || ""}
        messages={messages}
        loading={loading}
        coachMap={coachMap}
        ptMap={ptMap}
        shadowLine={shadowLine}
        feedback={feedback}
        showFeedback={showFeedback}
        timerSignal={timerSignal}
        tryPhrases={tryPhrases}
        onSend={sendMessage}
        onGetFeedback={getFeedback}
        onExit={exitChat}
      />
    );
  }

  return null;
};

export default Index;
