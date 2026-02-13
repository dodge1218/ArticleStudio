import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema, AnalyzeResponseSchema } from '@/lib/schemas';
import { generateJSON } from '@/lib/gemini-helper';

const ANALYZE_PROMPT = `
You are an expert editor and researcher. Your goal is to analyze a raw "prompt chain" (a multi-turn conversation between a user and an AI) and extract coherence from it.

INPUT:
- A prompt chain (transcript of a conversation).
- User constraints (audience, tone, length, platform).

TASK:
1. Digest the chain: What are the key topics? What is the core question or problem being explored?
2. Identify Claims: Extract key claims made in the chain. Label them:
    - "from_chain": Explicitly stated in the conversation.
    - "general_background": Common knowledge context.
    - "needs_verification": Specific stats, quotes, or bold claims that need external checking. (CRITICAL: Do not invent sources).
3. Generate 3 Distinct Article Angles (Options):
    - Option A: "Explainer" (Educational, clear, foundational).
    - Option B: "Meta Analysis" (Reflective, analyzes the *process* or the *implications* of the chain's topic).
    - Option C: "Research Brief" (Academic/Professional, focuses on what is known vs unknown, future directions).
    
    For EACH option, provide:
    - distinct title
    - thesis statement
    - high-level outline
    - specific research validation tasks

OUTPUT FORMAT:
Strict JSON matching this schema:
{
  "topicTitle": "Main Topic",
  "chainDigest": ["Key point 1", "Key point 2"],
  "coreQuestion": "The central question...",
  "claimMap": [
    {"claim": "claim text", "evidenceLevel": "from_chain" | "general_background" | "needs_verification", "notes": "optional"}
  ],
  "options": [
    {
      "id": "explainer",
      "title": "Title A",
      "thesis": "Thesis A",
      "outline": ["Section 1", "Section 2"],
      "bestFor": "Target Audience A",
      "researchToDo": ["Verify X"],
      "sourcesToCheck": ["Venue Y"],
      "keywords": ["Keyword Z"]
    },
    ... (id: "meta", id: "research_brief")
  ]
}
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chainText, audience, tone, length, platform, seoKeyword } = AnalyzeRequestSchema.parse(body);

    const fullPrompt = `
      ${ANALYZE_PROMPT}

      USER CONSTRAINTS:
      - Audience: ${audience || 'General'}
      - Tone: ${tone || 'Neutral/Professional'}
      - Length: ${length || 'Medium'}
      - Platform: ${platform || 'Blog'}
      - SEO Keyword: ${seoKeyword || 'None'}

      CHAIN TEXT:
      ${chainText}
    `;

    const data = await generateJSON(fullPrompt, AnalyzeResponseSchema);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze chain', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
