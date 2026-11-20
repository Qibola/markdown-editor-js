// Markdown editor — step 3: syntax highlighting for fenced code blocks.

// Escape the characters that matter in HTML so user text can never inject markup.
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Count words (runs of non-whitespace) and characters in the source text.
function countStats(text) {
  const trimmed = text.trim();
  return {
    words: trimmed === "" ? 0 : trimmed.split(/\s+/).length,
    chars: text.length,
  };
}

function formatStats({ words, chars }) {
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  return `${plural(words, "word")} · ${plural(chars, "character")}`;
}

// Only allow link targets that can't run script: http(s), mailto, or
// scheme-less (relative paths and #anchors). Anything else becomes "#".
function safeUrl(url) {
  const scheme = url.match(/^\s*([a-z][a-z0-9+.-]*):/i);
  if (scheme && !/^(https?|mailto)$/i.test(scheme[1])) return "#";
  return url;
}

// Inline Markdown: `code`, **bold**, *italic* / _italic_, [text](url).
// The text is escaped first, so every tag in the output is one we added.
function renderInline(text) {
  const codeSpans = [];
  // Pull code spans out first so their contents aren't formatted.
  let html = escapeHtml(text.replace(/\u0000/g, "")).replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(`<code>${code}</code>`);
    return `\u0000${codeSpans.length - 1}\u0000`;
  });
  html = html
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `<a href="${safeUrl(url)}">${label}</a>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\b_(.+?)_\b/g, "<em>$1</em>");
  return html.replace(/\u0000(\d+)\u0000/g, (_, i) => codeSpans[Number(i)]);
}

// Syntax highlighting for fenced code blocks. Each language is a list of
// [tokenClass, regex] rules tried in order at the current position; the first
// match wins, so comments and strings are claimed before keywords inside them.
const JS_KEYWORDS = "break case catch class const continue default delete do else export extends finally for function if import in instanceof let new of return static super switch this throw try typeof var void while yield async await true false null undefined";
const PY_KEYWORDS = "and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield True False None self";
const wordsRe = (list) => new RegExp(`\\b(?:${list.split(" ").join("|")})\\b`, "y");

const HIGHLIGHT_RULES = {
  js: [
    ["comment", /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y],
    ["string", /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*(?:\1|$)/y],
    ["keyword", wordsRe(JS_KEYWORDS)],
    ["number", /\b(?:0[xX][\da-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/y],
  ],
  python: [
    ["comment", /#[^\n]*/y],
    ["string", /("""|''')[\s\S]*?(?:\1|$)|(["'])(?:\\.|(?!\2)[^\\\n])*(?:\2|$)/y],
    ["keyword", wordsRe(PY_KEYWORDS)],
    ["number", /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y],
  ],
  css: [
    ["comment", /\/\*[\s\S]*?(?:\*\/|$)/y],
    ["string", /(["'])(?:\\.|(?!\1)[^\\\n])*(?:\1|$)/y],
    ["keyword", /[\w-]+(?=\s*:)/y],
    ["number", /#[\da-fA-F]{3,8}\b|-?\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?/y],
  ],
};
const LANGUAGE_ALIASES = { javascript: "js", ts: "js", typescript: "js", json: "js", py: "python" };

// Return escaped HTML for `code`, with recognised tokens wrapped in
// <span class="tok-…">. Unknown languages are escaped but left plain.
function highlightCode(code, lang) {
  const key = String(lang || "").toLowerCase();
  const rules = HIGHLIGHT_RULES[LANGUAGE_ALIASES[key] || key];
  if (!rules) return escapeHtml(code);

  let html = "";
  let plain = "";
  let pos = 0;
  while (pos < code.length) {
    let matched = null;
    // Only start a token at a word boundary so `item2` doesn't yield a number.
    if (pos === 0 || !/\w/.test(code[pos - 1]) || !/\w/.test(code[pos])) {
      for (const [cls, re] of rules) {
        re.lastIndex = pos;
        const m = re.exec(code);
        if (m && m[0].length) { matched = [cls, m[0]]; break; }
      }
    }
    if (matched) {
      html += escapeHtml(plain) + `<span class="tok-${matched[0]}">${escapeHtml(matched[1])}</span>`;
      plain = "";
      pos += matched[1].length;
    } else {
      plain += code[pos++];
    }
  }
  return html + escapeHtml(plain);
}

// Block-level Markdown: headings, fenced code, lists, horizontal rules, paragraphs.
function renderMarkdown(source) {
  const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let paragraph = [];
  let list = null; // { tag: "ul" | "ol", items: [] }

  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${renderInline(i)}</li>`).join("")}</${list.tag}>`);
    list = null;
  };
  const flushAll = () => { flushParagraph(); flushList(); };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;

    if ((m = line.match(/^```\s*([\w-]*)\s*$/))) {
      flushAll();
      const code = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) code.push(lines[i++]);
      const cls = m[1] ? ` class="language-${m[1]}"` : "";
      out.push(`<pre><code${cls}>${highlightCode(code.join("\n"), m[1])}</code></pre>`);
    } else if ((m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/))) {
      flushAll();
      const level = m[1].length;
      out.push(`<h${level}>${renderInline(m[2])}</h${level}>`);
    } else if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushAll();
      out.push("<hr>");
    } else if ((m = line.match(/^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/))) {
      flushParagraph();
      const tag = m[1] ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      if (!list) list = { tag, items: [] };
      list.items.push(m[3]);
    } else if (line.trim() === "") {
      flushAll();
    } else if (list && /^\s+\S/.test(line)) {
      // Indented continuation of the previous list item.
      list.items[list.items.length - 1] += " " + line.trim();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushAll();
  return out.join("\n");
}

// Browser-only wiring: re-render the preview and stats on every keystroke.
if (typeof document !== "undefined") {
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const stats = document.getElementById("stats");

  function update() {
    preview.innerHTML = renderMarkdown(editor.value);
    stats.textContent = formatStats(countStats(editor.value));
  }

  editor.addEventListener("input", update);
  update();
}

if (typeof module !== "undefined") {
  module.exports = { escapeHtml, countStats, formatStats, safeUrl, renderInline, highlightCode, renderMarkdown };
}
