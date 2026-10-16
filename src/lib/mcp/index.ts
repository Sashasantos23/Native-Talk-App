import { defineMcp } from "@lovable.dev/mcp-js";
import listScenarios from "./tools/list-scenarios";
import listLevels from "./tools/list-levels";
import listVoices from "./tools/list-voices";
import getDailyMission from "./tools/get-daily-mission";

export default defineMcp({
  name: "nativetalk-mcp",
  title: "NativeTalk MCP",
  version: "0.1.0",
  instructions:
    "Tools for NativeTalk — an English conversation practice app. Use these tools to explore available practice scenarios, proficiency levels, and accent voices, or to suggest a daily English practice mission to a learner.",
  tools: [listScenarios, listLevels, listVoices, getDailyMission],
});
