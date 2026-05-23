import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage } from '../../lib/og';

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((doc) => ({ params: { slug: doc.id } }));
}

export const GET: APIRoute = async ({ params }) => {
  const docs = await getCollection('docs');
  const doc = docs.find((d) => d.id === params.slug);
  if (!doc) return new Response('Not found', { status: 404 });

  const png = await renderOgImage({
    title: doc.data.title,
    description: doc.data.description,
    kicker: 'ilo docs',
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
