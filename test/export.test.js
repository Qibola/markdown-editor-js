const test = require("node:test");
const assert = require("node:assert/strict");
const {
  documentTitle, exportFilename, buildHtmlDocument, initialTheme, nextTheme, themeButtonLabel,
} = require("../script.js");

test("documentTitle uses the first heading, without inline markup", () => {
  assert.equal(documentTitle("intro\n\n## My **Big** `Notes`\n\n# Later"), "My Big Notes");
  assert.equal(documentTitle("# Fish & <Chips>"), "Fish & <Chips>");
});

test("documentTitle ignores headings inside code fences", () => {
  assert.equal(documentTitle("```sh\n# a comment\n```\n# Real"), "Real");
  assert.equal(documentTitle("no headings"), "Untitled");
});

test("exportFilename makes a safe slug", () => {
  assert.equal(exportFilename("My Notes: Part 2!"), "my-notes-part-2.html");
  assert.equal(exportFilename("../../etc/passwd"), "etc-passwd.html");
  assert.equal(exportFilename("Café notes"), "café-notes.html");
  assert.equal(exportFilename("!!!"), "document.html");
});

test("buildHtmlDocument is a complete document with embedded styles", () => {
  const html = buildHtmlDocument("# Hi\n\n```js\nconst a = 1;\n```");
  assert.match(html, /^<!DOCTYPE html>/);
  assert.match(html, /<title>Hi<\/title>/);
  assert.match(html, /<h1>Hi<\/h1>/);
  assert.match(html, /\.tok-keyword \{/);
  assert.match(html, /<span class="tok-keyword">const<\/span>/);
  assert.doesNotMatch(html, /<link|<script/);
});

test("buildHtmlDocument cannot be broken out of via the title or body", () => {
  const html = buildHtmlDocument("# </title><script>alert(1)</script>\n\n<img src=x onerror=alert(1)>");
  assert.doesNotMatch(html, /<script|<img/);
  assert.match(html, /<title>&lt;\/title&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/title>/);
});

test("theme helpers", () => {
  assert.equal(initialTheme(true), "dark");
  assert.equal(initialTheme(false), "light");
  assert.equal(nextTheme("dark"), "light");
  assert.equal(nextTheme("light"), "dark");
  assert.equal(themeButtonLabel("dark"), "Light mode");
  assert.equal(themeButtonLabel("light"), "Dark mode");
});
