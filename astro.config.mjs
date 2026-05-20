// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'fs';

const iloGrammar = JSON.parse(readFileSync(new URL('./ilo.tmLanguage.json', import.meta.url), 'utf-8'));

export default defineConfig({
  site: 'https://ilo-lang.ai',
  redirects: {
    '/docs/manifesto': '/docs/learn/manifesto',
    '/docs/introduction': '/docs/learn/introduction',
    '/docs/installation': '/docs/learn/install',
    '/docs/first-program': '/docs/learn/getting-started',
    '/docs/multi-function': '/docs/learn/getting-started',
    '/docs/repl': '/docs/reference/repl',
    '/docs/guide/types-and-functions': '/docs/reference/types-and-functions',
    '/docs/guide/prefix-notation': '/docs/reference/prefix-notation',
    '/docs/guide/guards': '/docs/reference/guards',
    '/docs/guide/loops': '/docs/reference/loops',
    '/docs/guide/pipes': '/docs/reference/pipes',
    '/docs/guide/error-handling': '/docs/reference/error-handling',
    '/docs/guide/imports': '/docs/reference/imports',
    '/docs/guide/memory-model': '/docs/reference/memory-model',
    '/docs/guide/gotchas': '/docs/reference/gotchas',
    '/docs/guide/examples': '/docs/learn/examples',
    '/docs/guide/collections': '/docs/builtins/collections',
    '/docs/guide/data-io': '/docs/builtins/data-io',
    '/docs/reference/spec': '/docs/reference/language',
    '/docs/reference/builtins': '/docs/builtins/numbers',
    '/docs/reference/error-codes': '/docs/reference/diagnostics',
    '/docs/integrations/agent-skills': '/docs/builtins/tools',
    '/docs/integrations/repl-json': '/docs/builtins/tools',
    '/docs/integrations/mcp': '/docs/builtins/tools',
    '/docs/integrations/http-tools': '/docs/builtins/http',
  },
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
        Head: './src/components/StarlightHead.astro',
      },
      sidebar: [
        {
          label: 'Learn',
          items: [
            { label: 'Introduction', slug: 'docs/learn/introduction' },
            { label: 'Manifesto', slug: 'docs/learn/manifesto' },
            { label: 'Learning Path', slug: 'docs/learn/learn' },
            { label: 'Getting Started', slug: 'docs/learn/getting-started' },
            { label: 'Install', slug: 'docs/learn/install' },
            { label: 'Real-World Examples', slug: 'docs/learn/examples' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Language', slug: 'docs/reference/language' },
            { label: 'Primitives', slug: 'docs/reference/primitives' },
            { label: 'Types & Functions', slug: 'docs/reference/types-and-functions' },
            { label: 'Prefix Notation', slug: 'docs/reference/prefix-notation' },
            { label: 'Guards & Control Flow', slug: 'docs/reference/guards' },
            { label: 'Loops', slug: 'docs/reference/loops' },
            { label: 'Error Handling', slug: 'docs/reference/error-handling' },
            { label: 'Pipes', slug: 'docs/reference/pipes' },
            { label: 'Imports', slug: 'docs/reference/imports' },
            { label: 'Memory Model', slug: 'docs/reference/memory-model' },
            { label: 'REPL', slug: 'docs/reference/repl' },
            { label: 'CLI', slug: 'docs/reference/cli' },
            { label: 'Engines', slug: 'docs/reference/engines' },
            { label: 'Diagnostics', slug: 'docs/reference/diagnostics' },
            { label: 'Benchmarks', slug: 'docs/reference/benchmarks' },
            { label: 'Gotchas', slug: 'docs/reference/gotchas' },
            { label: 'Syntax Experiments', slug: 'docs/reference/syntax-experiments' },
          ],
        },
        {
          label: 'Builtins',
          items: [
            { label: 'Numbers', slug: 'docs/builtins/numbers' },
            { label: 'Text', slug: 'docs/builtins/text' },
            { label: 'Collections', slug: 'docs/builtins/collections' },
            { label: 'Data & I/O', slug: 'docs/builtins/data-io' },
            { label: 'HTTP', slug: 'docs/builtins/http' },
            { label: 'Crypto & encoding', slug: 'docs/builtins/crypto' },
            { label: 'Tools', slug: 'docs/builtins/tools' },
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
