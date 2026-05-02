import type { APIRoute } from 'astro';
import { spec } from '../lib/spec';

const fmtBuiltin = (b: { name: string; alias?: string; sig: string; native_only?: boolean }) => {
  const aliasPart = b.alias ? `|${b.alias}` : '';
  const native = b.native_only ? ' [native]' : '';
  return `${b.name}${aliasPart}:${b.sig}${native}`;
};

const fmtCategory = (
  label: string,
  items: ReadonlyArray<{ name: string; alias?: string; sig: string; native_only?: boolean }>,
) => `${label}: ${items.map(fmtBuiltin).join(' | ')}`;

const opLine = (
  label: string,
  items: ReadonlyArray<{ sym: string; sig: string; desc: string }>,
) => `${label}: ${items.map((o) => `${o.sym}(${o.sig})`).join(' ')}`;

export const GET: APIRoute = () => {
  const types = Object.entries(spec.types)
    .map(([k, v]) => `${k}=${v.name}`)
    .join(' ');

  const errors = Object.entries(spec.error_codes)
    .map(([code, desc]) => `${code} ${desc}`)
    .join('\n');

  const body = `# ilo v${spec.version}
${spec.description}

syntax
  ${spec.syntax.function_definition}
  call: ${spec.syntax.function_call}
  sep: ${spec.syntax.statement_separator}   comment: ${spec.syntax.comment}
  auto-unwrap: ${spec.syntax.auto_unwrap_suffix}   index: .0 .name   safe-nav: ${spec.features.safe_navigation.suffix}

types
  ${types}

operators
  ${opLine('arith', spec.operators.arithmetic)}
  ${opLine('comp', spec.operators.comparison)}
  ${opLine('logic', spec.operators.logic)}

builtins
  ${fmtCategory('text', spec.builtins.text)}
  ${fmtCategory('list', spec.builtins.list)}
  ${fmtCategory('hof', spec.builtins.higher_order)}
  ${fmtCategory('agg', spec.builtins.aggregation)}
  ${fmtCategory('map', spec.builtins.map)}
  ${fmtCategory('conv', spec.builtins.type_conversion)}
  ${fmtCategory('io', spec.builtins.io_http)}
  ${fmtCategory('json', spec.builtins.json)}
  ${fmtCategory('out', spec.builtins.output)}
  ${fmtCategory('time', spec.builtins.time)}

errors
${errors
  .split('\n')
  .map((l) => '  ' + l)
  .join('\n')}

examples
  inline: ${spec.examples.inline}
  file: ${spec.examples.file}
  fn: ${spec.examples.function}

full json: ${spec.homepage}/spec.json
docs: ${spec.homepage}/llms.txt
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
