import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

// In Next.js dev mode, the global object is preserved across reloads.
// This prevents creating too many instances of the client.
const globalForGenAI = global as unknown as { genai: GoogleGenerativeAI };

export const genai =
  globalForGenAI.genai ||
  new GoogleGenerativeAI(apiKey);

if (process.env.NODE_ENV !== "production") globalForGenAI.genai = genai;
