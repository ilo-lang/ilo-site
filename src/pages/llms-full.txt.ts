import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://ilo-lang.ai';

export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs')).sort((a, b) => a.id.localeCompare(b.id));

  const sections = docs.map((doc) => {
    const slug = doc.id.replace(/\.md$/, '');
    const url = `${SITE_URL}/${slug}/`;
    const title = doc.data.title || doc.id;
    const description = doc.data.description || '';
    return `# ${title}

URL: ${url}
${description ? description + '\n' : ''}
${doc.body}`;
  });

  const body = `# ilo - Full Documentation

> Token-optimised programming language for AI agents.

Generated: ${new Date().toISOString().slice(0, 10)}
Source: ${SITE_URL}
Documents: ${docs.length}

---

${sections.join('\n\n---\n\n')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
