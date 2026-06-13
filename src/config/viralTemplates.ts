export interface HookFormula {
  id: string;
  template: string;
  example: string;
  bestFor: string[];
  emotion: string;
}

export interface CTATemplate {
  id: string;
  template: string;
  bestFor: string[];
}

export const HOOK_FORMULAS: HookFormula[] = [
  // Pattern Interrupt
  {
    id: 'nobody_talks_about',
    template: 'Nobody talks about this, but {insight}...',
    example: "Nobody talks about this, but most sales reps lose deals before they even start...",
    bestFor: ['tiktok', 'instagram', 'facebook'],
    emotion: 'curiosity',
  },
  {
    id: 'stop_scrolling',
    template: 'Stop scrolling if you want to {desired_outcome}',
    example: 'Stop scrolling if you want to double your close rate this month',
    bestFor: ['tiktok', 'instagram'],
    emotion: 'pattern_interrupt',
  },
  {
    id: 'pov',
    template: 'POV: You finally understand why {situation}',
    example: "POV: You finally understand why your sales calls aren't converting",
    bestFor: ['tiktok', 'instagram'],
    emotion: 'relatability',
  },
  // Results / Proof
  {
    id: 'income_result',
    template: 'I {verb} ${amount}k doing {activity} — here\'s the exact system:',
    example: "I generated $200k doing this ONE thing — here's the exact system:",
    bestFor: ['tiktok', 'youtube', 'facebook'],
    emotion: 'aspiration',
  },
  {
    id: 'transformation',
    template: 'I went from {baseline} to {result} in {timeframe}. Here\'s how:',
    example: 'I went from zero to 6-figure income in 18 months. Here\'s how:',
    bestFor: ['youtube', 'facebook', 'instagram'],
    emotion: 'aspiration',
  },
  {
    id: 'team_result',
    template: 'This single shift in how I {action} added {metric} to my business:',
    example: 'This single shift in how I trained my sales team added $50k/month:',
    bestFor: ['linkedin', 'youtube'],
    emotion: 'proof',
  },
  // Pain Points
  {
    id: 'number_one_mistake',
    template: 'The #1 mistake {audience} make when trying to {goal} (and how to fix it)',
    example: 'The #1 mistake sales leaders make when trying to scale (and how to fix it)',
    bestFor: ['linkedin', 'youtube', 'facebook'],
    emotion: 'pain_point',
  },
  {
    id: 'stop_doing',
    template: 'Stop {wrong_action}. Start {right_action}. Here\'s why:',
    example: "Stop pitching features. Start selling outcomes. Here's why:",
    bestFor: ['linkedin', 'tiktok', 'instagram'],
    emotion: 'authority',
  },
  {
    id: 'costing_you',
    template: 'This one habit is costing {audience} thousands every month',
    example: 'This one habit is costing sales reps thousands every month',
    bestFor: ['tiktok', 'instagram', 'facebook'],
    emotion: 'fear_of_loss',
  },
  // Value Lists
  {
    id: 'n_things',
    template: '{number} {topic} that will {positive_transformation} your {area}',
    example: '5 sales frameworks that will transform your close rate',
    bestFor: ['youtube', 'linkedin', 'instagram'],
    emotion: 'value_promise',
  },
  {
    id: 'ai_tools',
    template: '{number} AI tools my {role} uses that 99% of {audience} don\'t know about',
    example: "3 AI tools my sales team uses that 99% of reps don't know about",
    bestFor: ['tiktok', 'instagram', 'youtube'],
    emotion: 'insider_knowledge',
  },
  // Controversy / Opinion
  {
    id: 'controversial',
    template: 'Controversial opinion: {bold_statement}',
    example: "Controversial opinion: cold calling is still the fastest path to 6 figures",
    bestFor: ['linkedin', 'tiktok'],
    emotion: 'debate',
  },
  {
    id: 'what_they_dont_tell',
    template: 'What {authority}s don\'t tell you about {topic}',
    example: "What sales coaches don't tell you about closing high-ticket deals",
    bestFor: ['tiktok', 'instagram', 'facebook'],
    emotion: 'insider_knowledge',
  },
  // DustinAI Signature Hooks
  {
    id: 'dustin_real_talk',
    template: 'Real talk: {honest_insight}',
    example: "Real talk: your sales script isn't the problem — your mindset is",
    bestFor: ['tiktok', 'instagram', 'facebook'],
    emotion: 'authenticity',
  },
  {
    id: 'atlas_finance',
    template: 'Most people will never build wealth because {mindset_gap}. Here\'s the truth:',
    example: "Most people will never build wealth because they trade time for money. Here's the truth:",
    bestFor: ['instagram', 'facebook', 'youtube'],
    emotion: 'aspiration',
  },
  {
    id: 'leadership_truth',
    template: 'The best leaders I know all have ONE thing in common:',
    example: 'The best leaders I know all have ONE thing in common:',
    bestFor: ['linkedin', 'youtube', 'facebook'],
    emotion: 'curiosity',
  },
];

export const CTA_TEMPLATES: CTATemplate[] = [
  {
    id: 'follow_value',
    template: 'Follow for daily {topic} strategies that actually work',
    bestFor: ['tiktok', 'instagram'],
  },
  {
    id: 'dm_keyword',
    template: 'DM me "{keyword}" and I\'ll send you my {offer} for free',
    bestFor: ['instagram', 'facebook'],
  },
  {
    id: 'comment_unlock',
    template: 'Comment "{word}" below and I\'ll send you the full {resource}',
    bestFor: ['tiktok', 'instagram', 'facebook'],
  },
  {
    id: 'link_in_bio',
    template: 'Link in bio → Get my free {resource_type}',
    bestFor: ['instagram', 'tiktok'],
  },
  {
    id: 'question_engage',
    template: 'What\'s your biggest challenge with {topic}? Drop it below',
    bestFor: ['linkedin', 'facebook'],
  },
  {
    id: 'save_share',
    template: 'Save this before it gets buried — you\'ll need it',
    bestFor: ['instagram'],
  },
  {
    id: 'tag_someone',
    template: 'Tag a {audience} who needs to hear this',
    bestFor: ['facebook', 'instagram'],
  },
  {
    id: 'subscribe_cta',
    template: 'Subscribe for {frequency} {topic} content that moves the needle',
    bestFor: ['youtube'],
  },
];

export const DUSTINAI_BRAND_CONTEXT = `
DustinAI is a sales and leadership coaching brand founded by Dustin,
affiliated with Atlas Finance. The target audience includes:
- Sales professionals, SDRs, AEs, and sales leaders
- Entrepreneurs and business owners scaling their teams
- Professionals pursuing financial freedom and income growth
- People exploring Atlas Finance's programs and opportunities

Core content pillars:
1. Sales tactics, frameworks, and objection handling scripts
2. Leadership and team-building strategies
3. AI tools for sales automation (DustinAI platform)
4. Atlas Finance — wealth building, financial strategy, and opportunities

Brand voice: Authentic, high-energy, results-obsessed, no-fluff, relatable.
Tone: Confident but approachable. Speaks like a coach who's been in the trenches.
Signature phrases: "Let's get it", "This is how you win", "Real talk", "No BS".

Do NOT make specific financial guarantees or income claims that could be misleading.
DO use real frameworks, actionable tactics, and proven strategies.
`;

export const SEO_KEYWORDS_BY_NICHE: Record<string, string[]> = {
  sales: [
    'sales tips', 'sales training', 'how to close sales', 'sales scripts',
    'objection handling', 'sales mindset', 'high ticket sales', 'B2B sales',
    'sales leadership', 'sales coaching',
  ],
  leadership: [
    'leadership tips', 'team building', 'sales management', 'how to lead a team',
    'leadership mindset', 'executive coaching', 'scaling your business',
    'business growth', 'team culture', 'hiring sales team',
  ],
  ai_tools: [
    'AI for sales', 'sales automation', 'AI tools 2025', 'GoHighLevel tips',
    'CRM automation', 'AI business tools', 'sales tech stack',
    'marketing automation', 'DustinAI', 'AI sales coach',
  ],
  finance: [
    'Atlas Finance', 'financial freedom', 'income streams', 'passive income',
    'build wealth', 'financial literacy', 'money mindset',
    'entrepreneur finance', 'wealth building', 'business investing',
  ],
};
