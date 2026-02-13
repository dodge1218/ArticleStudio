import { z } from 'zod';

// --- Shared Types ---

export const ClaimSchema = z.object({
  claim: z.string(),
  evidenceLevel: z.enum(['from_chain', 'general_background', 'needs_verification']),
  notes: z.string().optional(),
});

export const ResearchItemSchema = z.object({
  question: z.string(),
  whyItMatters: z.string(),
  howToVerify: z.string(),
});

// --- Analyze API ---

export const AnalyzeRequestSchema = z.object({
  chainText: z.string().max(200000, "Prompt chain is too long (max 200k chars)"),
  audience: z.string().optional(),
  tone: z.string().optional(),
  length: z.string().optional(),
  platform: z.string().optional(),
  seoKeyword: z.string().optional(),
});

export const OptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  thesis: z.string(),
  outline: z.array(z.string()),
  bestFor: z.string(),
  researchToDo: z.array(z.string()),
  sourcesToCheck: z.array(z.string()),
  keywords: z.array(z.string()),
});

export const AnalyzeResponseSchema = z.object({
  topicTitle: z.string(),
  chainDigest: z.array(z.string()),
  coreQuestion: z.string(),
  claimMap: z.array(ClaimSchema),
  options: z.array(OptionSchema).length(3),
});

// --- Draft API ---

export const DraftRequestSchema = z.object({
  chainText: z.string(),
  optionId: z.string(),
  // Reuse constraints from analyze or pass strictly needed ones
  audience: z.string().optional(),
  tone: z.string().optional(),
  length: z.string().optional(),
  platform: z.string().optional(),
});

export const DraftResponseSchema = z.object({
  title: z.string(),
  lede: z.string(),
  articleMarkdown: z.string(),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    slug: z.string(),
  }),
  researchChecklist: z.array(ResearchItemSchema),
  claimMap: z.array(ClaimSchema),
  sourcePlaceholders: z.array(z.string()),
});

// --- Rewrite API ---

export const RewriteRequestSchema = z.object({
  articleMarkdown: z.string(),
  instruction: z.string(),
});

export const RewriteResponseSchema = z.object({
  articleMarkdown: z.string(),
});
