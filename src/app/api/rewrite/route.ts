import { NextRequest, NextResponse } from 'next/server';
import { RewriteRequestSchema, RewriteResponseSchema } from '@/lib/schemas';
import { generateJSON } from '@/lib/gemini-helper';

const REWRITE_PROMPT = `
You are an expert editor. 
TASK: Rewrite the provided article markdown based strictly on the user's instruction.

RULES:
1. Do NOT change factual claims or citations.
2. If the instruction is "shorten", remove fluff but keep key insights.
3. If the instruction is "punchier", use active voice and shorter sentences.
4. Keep the Markdown formatting intact.

OUTPUT:
Strict JSON: { "articleMarkdown": "..." }
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { articleMarkdown, instruction } = RewriteRequestSchema.parse(body);

    const fullPrompt = `
      ${REWRITE_PROMPT}

      INSTRUCTION: ${instruction}

      CURRENT ARTICLE:
      ${articleMarkdown}
    `;

    const data = await generateJSON(fullPrompt, RewriteResponseSchema);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Rewrite error:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite article', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
