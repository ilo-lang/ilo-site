import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const FONT_REGULAR = readFileSync(
  resolve(process.cwd(), 'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff'),
);
const FONT_BOLD = readFileSync(
  resolve(process.cwd(), 'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff'),
);

interface OgInput {
  title: string;
  description?: string;
  kicker?: string;
}

export async function renderOgImage({ title, description, kicker = 'ilo docs' }: OgInput) {
  const tree: any = {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '70px 80px',
        background: 'linear-gradient(135deg, #08080c 0%, #0e0e14 60%, #141420 100%)',
        color: '#e4e4e8',
        fontFamily: 'Inter',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: '22px',
              fontWeight: 400,
              color: '#f59e0b',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            },
            children: kicker,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: title.length > 60 ? '52px' : '68px',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: '#ffffff',
                  },
                  children: title,
                },
              },
              description
                ? {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '26px',
                        fontWeight: 400,
                        lineHeight: 1.4,
                        color: '#9a9ab0',
                        maxWidth: '1040px',
                      },
                      children:
                        description.length > 180
                          ? description.slice(0, 177) + '...'
                          : description,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '22px',
              color: '#6e6e88',
            },
            children: [
              { type: 'div', props: { children: 'ilo-lang.ai' } },
              {
                type: 'div',
                props: { style: { color: '#f59e0b' }, children: 'AI Agent Language' },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(tree, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: FONT_REGULAR, weight: 400, style: 'normal' },
      { name: 'Inter', data: FONT_BOLD, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}
