const test = require("node:test");
const assert = require("node:assert/strict");
const { renderInline, renderMarkdown, safeUrl } = require("../script.js");

test("headings h1-h6 render with inline formatting", () => {
  assert.equal(renderMarkdown("# Hello"), "<h1>Hello</h1>");
  assert.equal(renderMarkdown("### A *small* one ###"), "<h3>A <em>small</em> one</h3>");
  assert.equal(renderMarkdown("####### seven"), "<p>####### seven</p>");
});

test("emphasis, bold and inline code", () => {
  assert.equal(renderInline("**bold** and *it* and _it2_"), "<strong>bold</strong> and <em>it</em> and <em>it2</em>");
  assert.equal(renderInline("use `a*b*c` here"), "use <code>a*b*c</code> here");
  assert.equal(renderInline("snake_case_name stays"), "snake_case_name stays");
});

test("links render and dangerous schemes are neutralised", () => {
  assert.equal(renderInline("[site](https://example.com)"), '<a href="https://example.com">site</a>');
  assert.equal(renderInline("[x](javascript:alert(1))"), '<a href="#">x</a>)');
  assert.equal(safeUrl("docs/page.html#top"), "docs/page.html#top");
  assert.equal(safeUrl("mailto:a@b.co"), "mailto:a@b.co");
  assert.equal(safeUrl(" JavaScript:void(0)"), "#");
});

test("raw HTML is escaped, not rendered", () => {
  assert.equal(renderMarkdown("<img src=x onerror=alert(1)>"), "<p>&lt;img src=x onerror=alert(1)&gt;</p>");
});

test("unordered and ordered lists", () => {
  assert.equal(renderMarkdown("- one\n- **two**\n  continued"), "<ul><li>one</li><li><strong>two</strong> continued</li></ul>");
  assert.equal(renderMarkdown("1. first\n2. second"), "<ol><li>first</li><li>second</li></ol>");
  assert.equal(renderMarkdown("- a\n1. b"), "<ul><li>a</li></ul>\n<ol><li>b</li></ol>");
});

test("fenced code blocks keep contents verbatim and escaped", () => {
  assert.equal(
    renderMarkdown("```js\nconst x = 1 < 2; // **not bold**\n```"),
    '<pre><code class="language-js">const x = 1 &lt; 2; // **not bold**</code></pre>'
  );
  assert.equal(renderMarkdown("```\nunclosed"), "<pre><code>unclosed</code></pre>");
});

test("paragraphs join lines and split on blank lines; hr works", () => {
  assert.equal(renderMarkdown("one\ntwo\n\nthree"), "<p>one two</p>\n<p>three</p>");
  assert.equal(renderMarkdown("above\n\n---\n\nbelow"), "<p>above</p>\n<hr>\n<p>below</p>");
  assert.equal(renderMarkdown(""), "");
});
