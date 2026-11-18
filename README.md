# markdown-editor-js

A browser Markdown editor in vanilla JavaScript — live preview, syntax highlighting, HTML export, dark/light mode and autosave — built one small step at a time.

## Run it

Open `index.html` in any browser. No build step or dependencies.

Type Markdown in the left pane; the right pane shows the preview (plain escaped text for now — real Markdown rendering comes in the next step). The header shows a live word and character count.

## Test

```bash
node --test
```

## Roadmap

- [x] Scaffold: index.html/style.css/script.js/README + two-pane layout + word count
- [ ] Live preview with a basic Markdown-to-HTML renderer (headings, emphasis, lists, links, code)
- [ ] Syntax highlighting for fenced code blocks
- [ ] Export to HTML + dark/light mode toggle
- [ ] localStorage autosave + polish

## Files

- `index.html` — header with stats, editor textarea and preview pane
- `style.css` — two-pane grid layout (stacks on narrow screens)
- `script.js` — `escapeHtml`, word/character counting and the browser wiring
- `test/scaffold.test.js` — Node tests for escaping and stats
