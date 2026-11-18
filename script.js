// Markdown editor — step 1: scaffold (two-pane layout, escaped plain-text preview, word count).

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

// Browser-only wiring. The preview is plain escaped text for now;
// the next step swaps in a real Markdown-to-HTML renderer.
if (typeof document !== "undefined") {
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const stats = document.getElementById("stats");

  function update() {
    preview.innerHTML = escapeHtml(editor.value);
    stats.textContent = formatStats(countStats(editor.value));
  }

  editor.addEventListener("input", update);
  update();
}

if (typeof module !== "undefined") {
  module.exports = { escapeHtml, countStats, formatStats };
}
