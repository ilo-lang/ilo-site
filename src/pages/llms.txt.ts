import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE_URL = 'https://ilo-lang.ai';

export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs')).sort((a, b) => a.id.localeCompare(b.id));

  const grouped = new Map<string, typeof docs>();
  for (const doc of docs) {
    const segments = doc.id.split('/');
    const section = segments.length > 1 ? segments[1] : 'overview';
    const list = grouped.get(section) ?? [];
    list.push(doc);
    grouped.set(section, list);
  }

  const sectionOrder = ['overview', 'guide', 'reference', 'integrations'];
  const orderedSections = [
    ...sectionOrder.filter((s) => grouped.has(s)),
    ...[...grouped.keys()].filter((s) => !sectionOrder.includes(s)).sort(),
  ];

  const renderDoc = (doc: typeof docs[number]) => {
    const slug = doc.id.replace(/\.md$/, '');
    const url = `${SITE_URL}/${slug}/`;
    const title = doc.data.title || doc.id;
    const description = doc.data.description || '';
    return `- [${title}](${url}): ${description}`;
  };

  const sections = orderedSections
    .map((name) => {
      const items = grouped.get(name) ?? [];
      const heading = name.charAt(0).toUpperCase() + name.slice(1);
      return `## ${heading}\n\n${items.map(renderDoc).join('\n')}`;
    })
    .join('\n\n');

  const body = `# ilo

> Token-optimised programming language for AI agents. Prefix notation, strongly typed, verified before execution. Roughly 0.33x the tokens and 0.22x the characters of equivalent Python.

The intended author of an ilo program is an LLM. Type errors return compact codes (e.g. ILO-T004) rather than stack traces.

This file follows the [llms.txt](https://llmstxt.org) convention. Full content at [/llms-full.txt](${SITE_URL}/llms-full.txt). Machine-readable language manifest at [/spec.json](${SITE_URL}/spec.json).

## Key resources

- [GitHub](https://github.com/ilo-lang/ilo): source code and issues
- [Crates.io](https://crates.io/crates/ilo): Rust install
- [npm](https://www.npmjs.com/package/ilo-lang): Node install
- [Spec on GitHub](https://github.com/ilo-lang/ilo/blob/main/SPEC.md): canonical language spec
- [Wiki tutorial](https://github.com/ilo-lang/ilo/wiki): 10-lesson walkthrough

${sections}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
