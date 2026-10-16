import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const MISSIONS = [
  "Describe your morning routine to an imaginary coworker — speak for 1 minute without stopping.",
  "Order your favourite drink at a café today, entirely in English. Practice the order 3 times first!",
  "Watch a 2-minute English video and repeat one sentence exactly as the speaker said it.",
  "Write a short email in English about your weekend plans. Read it out loud when done.",
  "Think of 5 things you see around you and describe each one in a full English sentence.",
  "Introduce yourself in English — name, job, and one fun fact — as if meeting someone new.",
  "Call a business and ask a simple question in English (opening hours, directions, availability).",
  "Watch an English TV show for 10 minutes without subtitles and write down 3 new words you heard.",
];

export default defineTool({
  name: "get_daily_mission",
  title: "Get today's English practice mission",
  description: "Returns a short, achievable daily English practice mission for the student to complete outside of chat sessions.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: () => {
    const mission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
    return {
      content: [{ type: "text", text: mission }],
      structuredContent: { mission },
    };
  },
});
