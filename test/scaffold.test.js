const test = require("node:test");
const assert = require("node:assert/strict");
const { escapeHtml, countStats, formatStats } = require("../script.js");

test("escapeHtml neutralises HTML special characters", () => {
  assert.equal(
    escapeHtml(`<script>alert("x" & 'y')</script>`),
    "&lt;script&gt;alert(&quot;x&quot; &amp; &#39;y&#39;)&lt;/script&gt;"
  );
});

test("escapeHtml leaves plain text alone", () => {
  assert.equal(escapeHtml("Hello world"), "Hello world");
});

test("countStats counts words and characters", () => {
  assert.deepEqual(countStats("# Hello\n\nStart  writing"), { words: 4, chars: 23 });
});

test("countStats handles empty and whitespace-only text", () => {
  assert.deepEqual(countStats(""), { words: 0, chars: 0 });
  assert.deepEqual(countStats("   \n "), { words: 0, chars: 5 });
});

test("formatStats pluralises correctly", () => {
  assert.equal(formatStats({ words: 1, chars: 1 }), "1 word · 1 character");
  assert.equal(formatStats({ words: 0, chars: 12 }), "0 words · 12 characters");
});
