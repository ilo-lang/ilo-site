// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'fs';

const iloGrammar = JSON.parse(readFileSync(new URL('./ilo.tmLanguage.json', import.meta.url), 'utf-8'));

export default defineConfig({
  site: 'https://ilo-lang.ai',
  integrations: [
    starlight({
      expressiveCode: {
        frames: {
          showCopyToClipboardButton: true,
          extractFileNameFromCode: false,
          removeCommentsWhenCopyingTerminalFrames: false,
        },
        defaultProps: {
          frame: 'terminal',
          overridesByLang: {
            'ilo': { title: 'ilo' },
            'bash,sh,shell': { title: 'Shell' },
            'python': { title: 'Python' },
            'json': { title: 'JSON' },
            'powershell': { title: 'PowerShell' },
          },
        },
        styleOverrides: {
          frames: {
            frameBoxShadowCssValue: 'none',
            terminalTitlebarDotsForeground: 'transparent',
            terminalTitlebarDotsOpacity: '0',
            editorTabBarBorderBottomColor: 'rgba(255, 255, 255, 0.07)',
            terminalTitlebarBorderBottomColor: 'rgba(255, 255, 255, 0.07)',
            editorActiveTabBackground: 'transparent',
            editorActiveTabBorderColor: 'transparent',
            editorTabBarBackground: 'transparent',
            terminalTitlebarBackground: 'transparent',
          },
        },
        shiki: {
          langs: [iloGrammar],
        },
      },
      title: 'ilo',
      description: 'Token-optimised programming language for AI agents',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/ilo-lang/ilo' },
        { icon: 'reddit', label: 'Reddit', href: 'https://www.reddit.com/r/ilolang/' },
      ],
      customCss: ['./src/styles/global.css'],
      components: {
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      sidebar: [
        { label: 'Manifesto', slug: 'docs/manifesto' },
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'docs/introduction' },
            { label: 'Installation', slug: 'docs/installation' },
            { label: 'Your First Program', slug: 'docs/first-program' },
            { label: 'Multi-Function Programs', slug: 'docs/multi-function' },
            { label: 'The REPL', slug: 'docs/repl' },
          ],
        },
        {
          label: 'Language Guide',
          items: [
            { label: 'Types & Functions', slug: 'docs/guide/types-and-functions' },
            { label: 'Prefix Notation', slug: 'docs/guide/prefix-notation' },
            { label: 'Guards & Control Flow', slug: 'docs/guide/guards' },
            { label: 'Collections', slug: 'docs/guide/collections' },
            { label: 'Loops', slug: 'docs/guide/loops' },
            { label: 'Pipes', slug: 'docs/guide/pipes' },
            { label: 'Error Handling', slug: 'docs/guide/error-handling' },
            { label: 'Memory Model', slug: 'docs/guide/memory-model' },
            { label: 'Data & I/O', slug: 'docs/guide/data-io' },
            { label: 'Imports', slug: 'docs/guide/imports' },
            { label: 'Real-World Examples', slug: 'docs/guide/examples' },
            { label: 'Gotchas', slug: 'docs/guide/gotchas' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Specification', slug: 'docs/reference/spec' },
            { label: 'CLI Reference', slug: 'docs/reference/cli' },
            { label: 'Built-in Functions', slug: 'docs/reference/builtins' },
            { label: 'Error Codes', slug: 'docs/reference/error-codes' },
            { label: 'Benchmarks', slug: 'docs/reference/benchmarks' },
            { label: 'Syntax Experiments', slug: 'docs/reference/syntax-experiments' },
          ],
        },
        {
          label: 'Integrations',
          items: [
            { label: 'Agent Skills', slug: 'docs/integrations/agent-skills' },
            { label: 'REPL JSON Mode', slug: 'docs/integrations/repl-json' },
            { label: 'MCP Servers', slug: 'docs/integrations/mcp' },
            { label: 'HTTP Tools', slug: 'docs/integrations/http-tools' },
          ],
        },
      ],
      head: [
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#f59e0b' },
        },
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: 'https://cloud.umami.is/script.js',
            'data-website-id': '39ac022b-8282-43ec-8e1a-7fd9dc222f39',
          },
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
