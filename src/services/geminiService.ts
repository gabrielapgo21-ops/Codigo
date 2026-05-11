import { GoogleGenAI, Type } from "@google/genai";
import { WorkTask, TaskAnalysis, UserGoals } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeTasks(tasks: WorkTask[], goals: UserGoals): Promise<TaskAnalysis[]> {
  if (tasks.length === 0) return [];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Analyze these work tasks in the context of these goals:
      Goals: ${goals.mainGoal} (Focus: ${goals.focusArea})
      
      Tasks:
      ${tasks.map(t => `- [${t.id}] ${t.title}: ${t.description} (${t.hoursPerWeek}h/week, ${t.frequency}, ${t.repetitiveness*100}% repetitive)`).join('\n')}
      
      For each task, provide:
      1. automationScore (0-100) based on how easy/effective it is to automate or use AI for.
      2. reasoning: short explanation (max 2 sentences).
      3. suggestedPrompt: A specific, ready-to-use LLM prompt (if applicable) or automation instruction.
      4. automationTool: recommended tool (e.g., "ChatGPT", "Zapier", "Python Script").
      5. savingsEstimate: formatted string of estimated hours saved per month.
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            taskId: { type: Type.STRING },
            automationScore: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            suggestedPrompt: { type: Type.STRING },
            automationTool: { type: Type.STRING },
            savingsEstimate: { type: Type.STRING },
          },
          required: ["taskId", "automationScore", "reasoning", "suggestedPrompt", "automationTool", "savingsEstimate"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI analysis", e);
    return [];
  }
}
