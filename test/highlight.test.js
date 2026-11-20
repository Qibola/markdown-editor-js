const test = require("node:test");
const assert = require("node:assert/strict");
const { highlightCode, renderMarkdown } = require("../script.js");

const span = (cls, text) => `<span class="tok-${cls}">${text}</span>`;

test("JavaScript keywords, strings, numbers and comments", () => {
  assert.equal(
    highlightCode('const n = 42; // answer', "js"),
    `${span("keyword", "const")} n = ${span("number", "42")}; ${span("comment", "// answer")}`
  );
  assert.equal(highlightCode('log("hi")', "javascript"), `log(${span("string", "&quot;hi&quot;")})`);
});

test("tokens inside strings and comments are not re-highlighted", () => {
  assert.equal(highlightCode('"return 1"', "js"), span("string", "&quot;return 1&quot;"));
  assert.equal(highlightCode("/* if 2 */", "js"), span("comment", "/* if 2 */"));
});

test("keywords and numbers only match whole words", () => {
  assert.equal(highlightCode("item2 = format", "js"), "item2 = format");
  assert.equal(highlightCode("returned", "js"), "returned");
});

test("Python and CSS rules", () => {
  assert.equal(
    highlightCode("def f(): return None  # done", "py"),
    `${span("keyword", "def")} f(): ${span("keyword", "return")} ${span("keyword", "None")}  ${span("comment", "# done")}`
  );
  assert.equal(
    highlightCode("a { color: #fff; margin: 4px; }", "css"),
    `a { ${span("keyword", "color")}: ${span("number", "#fff")}; ${span("keyword", "margin")}: ${span("number", "4px")}; }`
  );
});

test("code is still escaped, highlighted or not", () => {
  assert.equal(highlightCode("<b>if</b>", "plaintext"), "&lt;b&gt;if&lt;/b&gt;");
  assert.equal(highlightCode('x = "<script>"', "js"), `x = ${span("string", "&quot;&lt;script&gt;&quot;")}`);
});

test("fenced code blocks in Markdown are highlighted", () => {
  assert.equal(
    renderMarkdown("```js\nlet x = 1;\n```"),
    `<pre><code class="language-js">${span("keyword", "let")} x = ${span("number", "1")};</code></pre>`
  );
  assert.equal(renderMarkdown("```\nlet x\n```"), "<pre><code>let x</code></pre>");
});
