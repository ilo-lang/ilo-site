import type { APIRoute } from 'astro';
import { spec } from '../lib/spec';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(spec, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
