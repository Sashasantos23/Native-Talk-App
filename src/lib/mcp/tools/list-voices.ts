import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const VOICES_BY_ACCENT: Record<string, { name: string; gender: string; description: string }[]> = {
  american: [
    { name: "Sarah", gender: "female", description: "Warm & clear" },
    { name: "Jessica", gender: "female", description: "Bright & natural" },
    { name: "Eric", gender: "male", description: "Casual & friendly" },
    { name: "Brian", gender: "male", description: "Deep & confident" },
  ],
  british: [
    { name: "Lily", gender: "female", description: "Soft & elegant" },
    { name: "Alice", gender: "female", description: "Crisp & natural" },
    { name: "Daniel", gender: "male", description: "Professional & refined" },
    { name: "George", gender: "male", description: "Warm & articulate" },
  ],
  australian: [
    { name: "Kylie", gender: "female", description: "Warm & friendly" },
    { name: "Hannah", gender: "female", description: "Natural & clear" },
    { name: "Bill", gender: "male", description: "Easygoing & clear" },
    { name: "Charlie", gender: "male", description: "Relaxed & natural" },
  ],
};

export default defineTool({
  name: "list_voices",
  title: "List available voices for an accent",
  description: "Returns the voices available for a given English accent (american, british, or australian). Each voice includes name, gender, and description.",
  inputSchema: {
    accent: z.enum(["american", "british", "australian"]).describe("The English accent to list voices for."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ accent }) => {
    const voices = VOICES_BY_ACCENT[accent] || [];
    return {
      content: [{ type: "text", text: JSON.stringify({ accent, voices }, null, 2) }],
      structuredContent: { accent, voices },
    };
  },
});
