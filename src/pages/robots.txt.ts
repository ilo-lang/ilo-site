import type { APIRoute } from 'astro';

const SITE_URL = 'https://ilo-lang.ai';

const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'meta-externalagent',
  'meta-externalfetcher',
  'Amazonbot',
  'Bytespider',
  'cohere-ai',
  'DuckAssistBot',
];

export const GET: APIRoute = () => {
  const aiBotBlock = AI_BOTS.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n');

  const robotsTxt = `User-agent: *
Allow: /

${aiBotBlock}

Sitemap: ${SITE_URL}/sitemap-index.xml
LLM-Index: ${SITE_URL}/llms.txt
LLM-Spec: ${SITE_URL}/spec.json
`;

  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
