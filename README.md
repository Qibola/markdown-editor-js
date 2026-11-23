# markdown-editor-js

A browser Markdown editor in vanilla JavaScript — live preview, syntax highlighting, HTML export, dark/light mode and autosave — built one small step at a time.

## Run it

Open `index.html` in any browser. No build step or dependencies.

Type Markdown in the left pane; the right pane renders a live HTML preview as you type. Supported syntax: `#`–`######` headings, `**bold**`, `*italic*` / `_italic_`, `` `inline code` ``, `[links](url)`, `-` / `*` / `+` and `1.` lists, fenced code blocks (triple backticks) and `---` rules. Raw HTML is escaped and only `http(s)`, `mailto` and relative links are allowed, so the preview can't run injected script. Fenced code blocks tagged `js` (also `javascript`, `ts`, `json`), `python` (`py`) or `css` get syntax highlighting for comments, strings, keywords and numbers; other languages render as plain escaped code. The header shows a live word and character count.

**Export HTML** downloads a self-contained `.html` file named after the document's first heading, with its styles embedded. The theme button switches between dark and light; the editor starts in your system's preference.

## Test

```bash
node --test
```

## Roadmap

- [x] Scaffold: index.html/style.css/script.js/README + two-pane layout + word count
- [x] Live preview with a basic Markdown-to-HTML renderer (headings, emphasis, lists, links, code)
- [x] Syntax highlighting for fenced code blocks
- [x] Export to HTML + dark/light mode toggle
- [ ] localStorage autosave + polish

## Files

- `index.html` — header with stats and export/theme buttons, editor textarea and preview pane
- `style.css` — two-pane grid layout (stacks on narrow screens), light/dark theme variables and code token colours
- `script.js` — `escapeHtml`, the `renderMarkdown` / `renderInline` renderer, the `highlightCode` tokenizer, word/character counting, HTML export, theme helpers and the browser wiring
- `test/scaffold.test.js` — Node tests for escaping and stats
- `test/markdown.test.js` — Node tests for the Markdown renderer (blocks, inline, link safety)
- `test/highlight.test.js` — Node tests for code highlighting (token types, word boundaries, escaping)
- `test/export.test.js` — Node tests for HTML export (title, filename, escaping) and theme helpers
