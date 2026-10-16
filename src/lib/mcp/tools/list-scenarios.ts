import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SCENARIOS = [
  { id: "cafe", label: "At the Café", description: "Order drinks, chat with a barista" },
  { id: "job", label: "Job Interview", description: "Practice professional answers" },
  { id: "meeting", label: "Work Meeting", description: "Speak up, share ideas, lead" },
  { id: "phone", label: "Phone Call", description: "Calls are scary — let's fix that" },
  { id: "travel", label: "Travel", description: "Navigate a new city with ease" },
  { id: "smalltalk", label: "Small Talk", description: "Weather, weekend plans, life" },
  { id: "debate", label: "Friendly Debate", description: "Share and defend your opinions" },
  { id: "doctor", label: "Doctor's Visit", description: "Describe symptoms, ask questions" },
  { id: "shopping", label: "Shopping", description: "Ask for help, compare items" },
  { id: "restaurant", label: "Restaurant", description: "Order food, handle any situation" },
];

export default defineTool({
  name: "list_scenarios",
  title: "List conversation scenarios",
  description: "Returns the 10 real-life English conversation scenarios available for practice in NativeTalk.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(SCENARIOS, null, 2) }],
    structuredContent: { scenarios: SCENARIOS },
  }),
});
