import { NextRequest, NextResponse } from 'next/server';
import { DraftRequestSchema, DraftResponseSchema } from '@/lib/schemas';
import { generateJSON } from '@/lib/gemini-helper';

const DRAFT_PROMPT = `
You are a senior staff writer. You will write a production-ready article based on a prompt chain and a selected "angle".

INPUTS:
1. Original Prompt Chain.
2. Selected Option (Title, Thesis, Outline).
3. Constraints (Audience, etc).

RULES:
1. **Integrity First**: Never invent citations. If a specific fact is needed but not in the chain, write "[SOURCE NEEDED: specific query]".
2. **Structure**: Follow the provided outline. 
3. **Sections**:
   - Include a "Counter-argument" section if appropriate.
   - Include a "What would change my mind" section.
4. **Style**: Consistent narrative arc. No "Here is the article" preambles.
5. **Formatting**: Markdown. Use H2 (##) for main sections.

OUTPUT FORMAT:
Strict JSON:
{
  "title": "Final Headline",
  "lede": "The opening paragraph/hook",
  "articleMarkdown": "Full article text in markdown...",
  "seo": {
    "metaTitle": "SEO Title",
    "metaDescription": "150 chars description",
    "slug": "url-slug-candidate"
  },
  "researchChecklist": [
    {"question": "What is x?", "whyItMatters": "Crucial for premise", "howToVerify": "Check Y"}
  ],
  "claimMap": [
     // Re-evaluate claims used in the draft
    {"claim": "claim used", "evidenceLevel": "from_chain" | "general_background" | "needs_verification"}
  ],
  "sourcePlaceholders": ["query 1", "query 2"]
}
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chainText, optionId, audience, tone, platform } = DraftRequestSchema.parse(body);
    
    // We pass the optionId to the prompt, but in a real app we might pass the full option object.
    // For now, we rely on the LLM to re-infer or we assume the client passed the full option context.
    // Wait, the user requirement said "Input: { chainText, optionId... }".
    // If the server is stateless, it doesn't know what "optionId" implies (the title/outline generated in step 1).
    // The client should probably pass the full Option object or the server needs to re-derive it.
    // However, the "Analyze" step returns options to the client. The client *selects* one.
    // To make this robust, I will assume the client passes the *Context* of the option, or I'll ask the model to "Draft the 'explainer' version of this chain".
    // Let's rely on the `optionId` being descriptive (explainer/meta/research_brief) and the chain text being present.
    // Better: The user prompt allows "constraints..." in input. I'll stick to the schema.
    
    // NOTE: In a stateful app, we'd store the analysis. Here, we'll ask the model to "Draft option [ID] from this chain".
    // This is valid because the model analyzes the chain and knows what an "explainer" for it looks like.

    const fullPrompt = `
      ${DRAFT_PROMPT}

      OPTION SELECTED: ${optionId} (The user wants the '${optionId}' angle).
      
      USER CONSTRAINTS:
      - Audience: ${audience || 'General'}
      - Tone: ${tone || 'Neutral'}
      - Platform: ${platform || 'Blog'}

      CHAIN TEXT:
      ${chainText}
    `;

    // Use a model with larger context window if needed, but flash is usually fine for 200k tokens.
    // Note: 1.5 Flash has 1M context.

    const data = await generateJSON(fullPrompt, DraftResponseSchema);

    // Post-processing to ensure markdown doesn't have JSON blocks if the model messed up (helper handles JSON parsing though)
    return NextResponse.json(data);
  } catch (error) {
    console.error('Draft error:', error);
    return NextResponse.json(
      { error: 'Failed to draft article', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
