// App data constants for NativeTalk

export const LEVELS = [
  { id: "starter", emoji: "🌱", label: "Starter", desc: "I know almost no English — guide me!" },
  { id: "beginner", emoji: "🌿", label: "Beginner", desc: "I know some words, need support" },
  { id: "intermediate", emoji: "🍃", label: "Intermediate", desc: "I can chat, but make mistakes" },
  { id: "advanced", emoji: "🌳", label: "Advanced", desc: "I want to sound like a native" },
] as const;

export const SCENARIOS = [
  { id: "cafe", emoji: "☕", label: "At the Café", desc: "Order drinks, chat with a barista" },
  { id: "job", emoji: "💼", label: "Job Interview", desc: "Practice professional answers" },
  { id: "meeting", emoji: "🖥️", label: "Work Meeting", desc: "Speak up, share ideas, lead" },
  { id: "phone", emoji: "📞", label: "Phone Call", desc: "Calls are scary — let's fix that" },
  { id: "travel", emoji: "✈️", label: "Travel", desc: "Navigate a new city with ease" },
  { id: "smalltalk", emoji: "💬", label: "Small Talk", desc: "Weather, weekend plans, life" },
  { id: "debate", emoji: "🎭", label: "Friendly Debate", desc: "Share and defend your opinions" },
  { id: "doctor", emoji: "🏥", label: "Doctor's Visit", desc: "Describe symptoms, ask questions" },
  { id: "shopping", emoji: "🛍️", label: "Shopping", desc: "Ask for help, compare items" },
  { id: "restaurant", emoji: "🍽️", label: "Restaurant", desc: "Order food, handle any situation" },
] as const;

export const MODES = [
  { id: "normal", emoji: "💬", label: "Normal", desc: "Relaxed conversation at your pace" },
  { id: "pressure", emoji: "⏱️", label: "Pressure Mode", desc: "25-sec timer — think fast, speak first!" },
  { id: "shadow", emoji: "🔄", label: "Shadow & Repeat", desc: "Listen carefully, then mirror exactly" },
] as const;

export const GOALS = [
  "Lead meetings in English",
  "Travel with confidence",
  "Make friends in English",
  "Get a better job",
  "Pass an English exam",
  "Enjoy movies without subtitles",
];

export const FEARS = [
  "Freezing up mid-sentence",
  "My accent sounds wrong",
  "People speak too fast",
  "I forget words at the worst moment",
  "Phone calls and video meetings",
  "Being judged or laughed at",
];

export const ACCENTS = [
  {
    id: "american", label: "American", flag: "🇺🇸",
    female: [
      { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", desc: "Warm & clear" },
      { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", desc: "Bright & natural" },
    ],
    male: [
      { id: "cjVigY5qzO86Huf0OWal", name: "Eric", desc: "Casual & friendly" },
      { id: "nPczCjzI2devNBz1zQrb", name: "Brian", desc: "Deep & confident" },
    ],
  },
  {
    id: "british", label: "British", flag: "🇬🇧",
    female: [
      { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", desc: "Soft & elegant" },
      { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", desc: "Crisp & natural" },
    ],
    male: [
      { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", desc: "Professional & refined" },
      { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", desc: "Warm & articulate" },
    ],
  },
  {
    id: "australian", label: "Australian", flag: "🇦🇺",
    female: [
      { id: "e1nbKcfTL4XYy71tZn9J", name: "Kylie", desc: "Warm & friendly" },
      { id: "M7ya1YbaeFaPXljg9BpK", name: "Hannah", desc: "Natural & clear" },
    ],
    male: [
      { id: "pqHfZKP75CvOlQylNhV4", name: "Bill", desc: "Easygoing & clear" },
      { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", desc: "Relaxed & natural" },
    ],
  },
];

export const ALL_VOICES = ACCENTS.flatMap(a => [...a.female, ...a.male]);


export const SPEECH_RATE: Record<string, number> = {
  starter: 0.72,
  beginner: 0.82,
  intermediate: 0.95,
  advanced: 1.05,
};

export interface ScenarioScript {
  role: string;
  context: string;
  flow: string[];
  naturalPhrases: string[];
  avoidPhrases: string[];
}

export const SCENARIO_SCRIPTS: Record<string, ScenarioScript> = {
  cafe: {
    role: "friendly barista named Alex at a busy neighbourhood café",
    context: "The student has just walked in. It's a normal weekday morning. You're behind the counter, wiping it down.",
    flow: [
      "Greet them warmly as they approach — 'Morning! What can I get for you?'",
      "Take their order. If unclear, ask: size? hot or iced? any milk preferences?",
      "Make small talk while 'making' the drink — weather, how their day is going, weekend plans",
      "Tell them the total, hand over the drink, wish them a good day",
      "If they linger, chat about the café, recommend something, ask if they're a regular",
    ],
    naturalPhrases: ["Coming right up!", "Good choice!", "That'll be $4.50", "Oat milk or regular?", "You want room for cream?", "Have a great one!"],
    avoidPhrases: ["As a barista I would say...", "In this scenario...", "Let me help you practice..."],
  },
  job: {
    role: "professional HR interviewer named Sarah at a mid-sized company",
    context: "The student is interviewing for a role related to their profession. This is a real interview — you are evaluating them.",
    flow: [
      "Start with a warm welcome and small talk to ease nerves: 'Thanks for coming in today. Did you find us okay?'",
      "Ask standard interview questions one at a time — tell me about yourself, why this role, strengths/weaknesses",
      "React naturally to their answers — follow up, probe deeper, show interest or mild skepticism",
      "Ask situational questions: 'Tell me about a time when...'",
      "Wrap up: 'Do you have any questions for us?' then 'We'll be in touch.'",
    ],
    naturalPhrases: ["That's really interesting, can you tell me more?", "I see. And how did that turn out?", "What would you say is your biggest strength?", "We're looking for someone who...", "Great, we'll be in touch within the week."],
    avoidPhrases: ["As an interviewer...", "In this practice scenario...", "Good job answering!"],
  },
  meeting: {
    role: "colleague named James in an ongoing team work meeting via video call",
    context: "The student has joined a team meeting. You're discussing a project update. Other 'colleagues' are implied but silent.",
    flow: [
      "Welcome them to the call: 'Oh good, you're here — we were just getting started.'",
      "Bring them up to speed briefly, then ask their input: 'What's your take on this?'",
      "React to their ideas — agree, push back, ask clarifying questions",
      "Raise a problem or disagreement for them to navigate: 'I'm not sure that approach will work because...'",
      "Ask them to present or explain something: 'Can you walk us through your plan?'",
    ],
    naturalPhrases: ["Can you elaborate on that?", "I hear you, but...", "Let's circle back to that.", "Good point — anyone else?", "Can we put a pin in that?", "What's your bandwidth like this week?"],
    avoidPhrases: ["As your meeting partner...", "In this work meeting scenario..."],
  },
  phone: {
    role: "real person receiving an unexpected phone call — could be a bank, clinic receptionist, or customer service rep",
    context: "The student has just called. You answer the phone. You can't see them. You're slightly busy.",
    flow: [
      "Answer naturally: '[Company name], this is [name], how can I help you?'",
      "Listen to their issue. Ask them to clarify or spell things if needed: 'Can you repeat that?', 'Could you spell your last name?'",
      "Put them 'on hold' briefly: 'Just one moment while I look that up...'",
      "Handle the request — confirm details, give information, resolve or escalate",
      "Wrap up professionally: 'Is there anything else I can help you with today?'",
    ],
    naturalPhrases: ["Bear with me one moment.", "I'm sorry, the line isn't great — could you repeat that?", "Let me pull up your account.", "I do apologise for the wait.", "Is there anything else I can assist you with?"],
    avoidPhrases: ["As a phone operator in this scenario...", "Let's practice phone English..."],
  },
  travel: {
    role: "friendly local resident in a city the student is visiting",
    context: "The student has just stopped you on the street for a chat. You are a genuine local — relaxed, helpful, and curious about visitors. You do NOT assume they want directions. Wait to hear what they actually want.",
    flow: [
      "Greet them warmly and ask how you can help or what brings them here",
      "Only give directions IF they specifically ask for them",
      "If they ask for recommendations, share your genuine local favourites",
      "Make friendly conversation — where are they from? how long are they visiting?",
      "Recommend local food, hidden gems, things tourists often miss",
    ],
    naturalPhrases: ["Oh lovely, where are you from?", "How long are you here for?", "Oh that place is brilliant — you have to try it.", "Honestly the best-kept secret around here is...", "You've picked a great time to visit!", "Oh that's just down the road — you can't miss it."],
    avoidPhrases: ["As a local guide...", "In this travel scenario...", "Let me give you directions...", "To get there you need to..."],
  },
  smalltalk: {
    role: "friendly neighbour or coworker named Pat who you see regularly but aren't close friends with",
    context: "You've bumped into the student — at the lift, in the break room, or outside. Natural, light, unplanned conversation.",
    flow: [
      "Start with a casual opener — weather, the day, something in the environment: 'Can you believe this heat?'",
      "Keep it light — weekend plans, a film, food, a local event",
      "Share your own opinions and ask theirs: 'I finally watched that series everyone's talking about — have you seen it?'",
      "Let the conversation flow naturally, change topics as it would in real life",
      "End naturally: 'Anyway, I'll let you get on — good to chat!'",
    ],
    naturalPhrases: ["Not bad, not bad. You?", "Tell me about it!", "Oh really? I hadn't heard that.", "That's so funny you say that...", "We should grab a coffee sometime!", "Right, I won't keep you!"],
    avoidPhrases: ["As your conversation partner...", "Let's practice small talk..."],
  },
  debate: {
    role: "a thoughtful, opinionated friend who loves a good discussion — not aggressive, just genuinely engaged",
    context: "You're having a casual debate over coffee. You have strong but open opinions. You enjoy being challenged.",
    flow: [
      "Pick a relatable topic connected to their life: remote work, social media, city vs countryside life, work-life balance",
      "State your opening position clearly but without being aggressive",
      "Listen to their argument, then respond — agree partially, challenge, or counter with evidence",
      "Ask follow-up questions: 'But what about...?', 'Do you really think that works in practice?'",
      "Concede gracefully if they make a good point: 'Okay, fair point — I'll give you that.'",
    ],
    naturalPhrases: ["I get what you're saying, but...", "That's actually a fair point.", "Come on, you don't really believe that!", "Let me push back on that a little.", "Okay, you've almost convinced me."],
    avoidPhrases: ["As your debate partner...", "In this debate scenario..."],
  },
  doctor: {
    role: "a calm, professional GP (general practitioner) doctor named Dr. Chen at a routine appointment",
    context: "The student has come in for an appointment. This is practice — not real medical advice. You take notes and ask questions.",
    flow: [
      "Welcome them warmly: 'Come in, take a seat. So what brings you in today?'",
      "Listen to their symptoms. Ask follow-up medical questions one at a time: 'How long has this been going on?', 'Does it get worse at any particular time?'",
      "Show empathy: 'That does sound uncomfortable. Let me ask you a few more questions.'",
      "Give a simple, reassuring explanation (non-specific): 'It sounds like it could be...'",
      "Explain next steps: 'I'd like to run a quick test / I'll write you a prescription / Come back if it gets worse.'",
    ],
    naturalPhrases: ["On a scale of one to ten, how would you rate the pain?", "Any fever or chills?", "Are you taking any medications currently?", "That's completely normal, nothing to worry about.", "Let's keep an eye on that."],
    avoidPhrases: ["As a practice doctor...", "In this medical scenario..."],
  },
  shopping: {
    role: "helpful shop assistant named Mia in a clothing or general goods store",
    context: "The student has just walked into your section of the store. You're folding clothes or restocking a shelf.",
    flow: [
      "Greet them naturally: 'Hi there! Let me know if you need any help finding anything.'",
      "When they ask for something, guide them: size, colour, price range questions",
      "Fetch items, suggest alternatives: 'We're out of that in blue, but we have it in navy — want to see?'",
      "Handle common situations — returns, fitting rooms, card payments, discounts",
      "Wrap up the sale: 'Great choice! I'll take you to the till.'",
    ],
    naturalPhrases: ["We've actually got those on sale this week.", "What size are you normally?", "The fitting rooms are just around the corner.", "Did you find everything you were looking for?", "Have you got a loyalty card with us?"],
    avoidPhrases: ["As your shop assistant...", "In this shopping scenario..."],
  },
  restaurant: {
    role: "friendly waiter named Marco at a mid-range sit-down restaurant",
    context: "The student has just been seated. You approach with menus and water.",
    flow: [
      "Greet and hand menus: 'Good evening! Here are your menus — can I start you off with some drinks?'",
      "Take the drinks order, then return for food: 'Are you ready to order, or do you need a few more minutes?'",
      "Take the food order — ask about allergies, how they want their steak cooked, starters vs mains",
      "React to any issues — wrong order, complaint, asking for the bill",
      "Check in mid-meal: 'Is everything tasting okay for you?'",
      "Bring the bill: 'Whenever you're ready — no rush!'",
    ],
    naturalPhrases: ["Excellent choice!", "And how would you like that cooked?", "I'll give you a moment to decide.", "Of course, I'll get that sorted for you.", "Any food allergies I should let the kitchen know about?", "Can I get you anything else?"],
    avoidPhrases: ["As your waiter in this scenario...", "Let's practice ordering food..."],
  },
};

export interface UserProfile {
  name: string;
  job: string;
  goal: string;
  fear: string;
  level?: string;
  onboarded?: boolean;
}

export interface WordEntry {
  tip: string;
  date: string;
  scenario: string;
  id: number;
}

export interface SessionEntry {
  date: string;
  scenario: string;
  level: string;
  mode: string;
  msgs: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
