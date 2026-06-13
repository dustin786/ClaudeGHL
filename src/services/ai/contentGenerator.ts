import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/config';
import {
  HOOK_FORMULAS,
  CTA_TEMPLATES,
  DUSTINAI_BRAND_CONTEXT,
  SEO_KEYWORDS_BY_NICHE,
} from '../../config/viralTemplates';
import { PLATFORM_SPECS } from '../../config/platforms';
import { buildPostSchedule } from '../../utils/dateHelper';
import { withRetry } from '../../utils/retry';
import { logger } from '../../utils/logger';
import {
  ContentInput,
  ContentPackage,
  PlatformContent,
  Platform,
  ContentCategory,
  ALL_PLATFORMS,
} from '../../types';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

function selectHooks(niche: string, count = 3) {
  const nicheMap: Record<string, string[]> = {
    sales: ['nobody_talks_about', 'income_result', 'number_one_mistake', 'stop_doing', 'dustin_real_talk'],
    leadership: ['leadership_truth', 'team_result', 'number_one_mistake', 'n_things', 'controversial'],
    ai_tools: ['ai_tools', 'nobody_talks_about', 'stop_doing', 'pov'],
    finance: ['atlas_finance', 'transformation', 'costing_you', 'what_they_dont_tell'],
  };
  const preferred = nicheMap[niche] ?? HOOK_FORMULAS.map((h) => h.id);
  return HOOK_FORMULAS.filter((h) => preferred.includes(h.id)).slice(0, count);
}

function buildPrompt(input: ContentInput): string {
  const { metadata, videoDuration } = input;
  const hooks = selectHooks(metadata.niche);
  const ctaExamples = CTA_TEMPLATES.slice(0, 4).map((c) => `- ${c.template}`).join('\n');
  const seoKeywords = SEO_KEYWORDS_BY_NICHE[metadata.niche]?.slice(0, 8).join(', ') ?? '';

  const platformDetails = (ALL_PLATFORMS as Platform[])
    .filter((p) => metadata.targetPlatforms.includes(p))
    .map((p) => {
      const spec = PLATFORM_SPECS[p];
      return `${p.toUpperCase()}: tone="${spec.tone}", max hashtags=${spec.maxHashtags}, max caption=${spec.maxCaptionLength} chars${spec.requiresTitle ? ', REQUIRES title field' : ''}`;
    })
    .join('\n');

  return `${DUSTINAI_BRAND_CONTEXT}

VIDEO DETAILS:
- Topic: ${metadata.topic}
- Target Audience: ${metadata.audience}
- Niche: ${metadata.niche}
- Video Duration: ${videoDuration} seconds
- Brand Notes: ${metadata.brandNotes ?? 'None'}
- Custom Hook (optional override): ${metadata.customHook ?? 'None — use your best judgment'}
- Target Platforms: ${metadata.targetPlatforms.join(', ')}

SEO KEYWORDS TO WEAVE IN: ${seoKeywords}

AVAILABLE HOOK FORMULAS (choose the best one or adapt):
${hooks.map((h, i) => `${i + 1}. [${h.id}] "${h.template}" (emotion: ${h.emotion})\n   Example: "${h.example}"`).join('\n')}

CTA EXAMPLES (adapt one per platform):
${ctaExamples}

PLATFORM REQUIREMENTS:
${platformDetails}

RULES:
1. Every caption MUST start with the chosen hook (first 1–2 lines)
2. LinkedIn caption first 200 chars = the "articleHook" visible before "see more"
3. YouTube: title must contain the primary SEO keyword in first 40 chars
4. Each hashtag must start with # and be lowercase/CamelCase
5. Do NOT make specific income guarantees ("you will make $X")
6. Keep TikTok captions punchy — no paragraph blocks
7. Include brand reference "DustinAI" naturally in at least 2 platform captions
8. The "thumbnailText" for YouTube should be 3–6 words max (for overlay graphic)

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "selectedHook": "the actual hook text you chose/adapted",
  "hookFormula": "the hook formula id you used",
  "contentCategory": "sales|leadership|ai_tools|finance|mindset|motivation",
  "seoKeywords": ["keyword1", "keyword2", ...],
  "repurposeIdeas": ["idea1", "idea2", "idea3"],
  "platforms": {
    "tiktok": {
      "caption": "...",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "cta": "..."
    },
    "instagram": {
      "caption": "...",
      "hashtags": ["#tag1", ...],
      "cta": "...",
      "altText": "..."
    },
    "facebook": {
      "caption": "...",
      "hashtags": ["#tag1", ...],
      "cta": "..."
    },
    "linkedin": {
      "caption": "...",
      "hashtags": ["#tag1", ...],
      "cta": "...",
      "articleHook": "first 200 chars visible before see more..."
    },
    "youtube": {
      "caption": "...",
      "hashtags": ["#tag1", ...],
      "cta": "...",
      "title": "SEO-optimized title under 70 chars",
      "description": "Full YouTube description 300-800 chars",
      "thumbnailText": "3-6 word overlay text"
    }
  }
}`;
}

function parseClaudeResponse(raw: string): Record<string, unknown> {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();
  return JSON.parse(cleaned);
}

export async function generatePlatformContent(input: ContentInput): Promise<ContentPackage> {
  const prompt = buildPrompt(input);

  const rawResponse = await withRetry(
    async () => {
      const msg = await client.messages.create({
        model: config.anthropic.model,
        max_tokens: 4096,
        system:
          'You are the AI content strategist for DustinAI. You generate viral social media content. Always respond with valid JSON only — no prose, no markdown.',
        messages: [{ role: 'user', content: prompt }],
      });

      const text = msg.content.find((b) => b.type === 'text')?.text ?? '';
      if (!text) throw new Error('Empty response from Claude');
      return text;
    },
    { attempts: 3, baseDelayMs: 2000, label: 'Claude content generation' }
  );

  let parsed: Record<string, unknown>;
  try {
    parsed = parseClaudeResponse(rawResponse);
  } catch (err) {
    logger.error('Failed to parse Claude response', { raw: rawResponse.slice(0, 500) });
    throw new Error(`Claude returned unparseable JSON: ${String(err)}`);
  }

  const schedule = buildPostSchedule(input.metadata.targetPlatforms);
  const platformsRaw = parsed.platforms as Record<string, Record<string, unknown>>;

  const platforms: Partial<Record<Platform, PlatformContent>> = {};
  for (const platform of input.metadata.targetPlatforms) {
    const p = platformsRaw[platform] ?? {};
    platforms[platform] = {
      platform,
      caption: String(p.caption ?? ''),
      hashtags: Array.isArray(p.hashtags) ? p.hashtags.map(String) : [],
      cta: String(p.cta ?? ''),
      title: p.title ? String(p.title) : undefined,
      description: p.description ? String(p.description) : undefined,
      thumbnailText: p.thumbnailText ? String(p.thumbnailText) : undefined,
      articleHook: p.articleHook ? String(p.articleHook) : undefined,
      altText: p.altText ? String(p.altText) : undefined,
      scheduledAt: schedule[platform],
    };
  }

  return {
    selectedHook: String(parsed.selectedHook ?? ''),
    hookFormula: String(parsed.hookFormula ?? ''),
    contentCategory: (parsed.contentCategory as ContentCategory) ?? 'sales',
    seoKeywords: Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords.map(String) : [],
    repurposeIdeas: Array.isArray(parsed.repurposeIdeas) ? parsed.repurposeIdeas.map(String) : [],
    platforms: platforms as Record<Platform, PlatformContent>,
  };
}
