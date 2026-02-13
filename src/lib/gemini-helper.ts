import { genai } from './genai';
import { z } from 'zod';

export const MODEL_NAME = "gemini-1.5-flash"; // Cost-effective and fast

export async function generateJSON<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  modelName: string = MODEL_NAME
): Promise<T> {
  const model = genai.getGenerativeModel({ model: modelName });

  // First attempt
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const responseText = result.response.text();

  try {
    const json = JSON.parse(responseText);
    return schema.parse(json);
  } catch (error) {
    console.warn("JSON validation failed, retrying with repair prompt...", error);
    
    // Retry with repair prompt
    const repairPrompt = `
      The previous JSON response was invalid or did not match the schema. 
      Error: ${error instanceof Error ? error.message : String(error)}
      
      Please fix the JSON to match the strict schema. 
      Output ONLY the fixed JSON.
      
      Original Response:
      ${responseText}
    `;

    const repairResult = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: repairPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const repairedText = repairResult.response.text();
    const repairedJson = JSON.parse(repairedText);
    return schema.parse(repairedJson);
  }
}
