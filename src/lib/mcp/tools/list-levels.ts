import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const LEVELS = [
  { id: "starter", label: "🌱 Starter", description: "Near-zero English — guided phrase suggestions in English + Portuguese" },
  { id: "beginner", label: "🌿 Beginner", description: "Simple words, short sentences, every mistake corrected" },
  { id: "intermediate", label: "🍃 Intermediate", description: "Natural pace, idioms, corrections woven in naturally" },
  { id: "advanced", label: "🌳 Advanced", description: "Full native speed, rich vocabulary, corrections only via coach tips" },
];

export default defineTool({
  name: "list_levels",
  title: "List English proficiency levels",
  description: "Returns NativeTalk's four English proficiency levels with descriptions of coaching style at each level.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(LEVELS, null, 2) }],
    structuredContent: { levels: LEVELS },
  }),
});
