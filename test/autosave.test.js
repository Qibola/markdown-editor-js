const test = require("node:test");
const assert = require("node:assert/strict");
const { startingTheme, STORAGE_KEYS, loadSaved, saveTo, debounce } = require("../script.js");

// Minimal in-memory stand-in for window.localStorage.
function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
  };
}

const throwingStorage = {
  getItem() { throw new Error("SecurityError"); },
  setItem() { throw new Error("QuotaExceededError"); },
};

test("saveTo and loadSaved round-trip a document", () => {
  const storage = memoryStorage();
  assert.equal(loadSaved(storage, STORAGE_KEYS.doc), null);
  assert.equal(saveTo(storage, STORAGE_KEYS.doc, "# Notes\n\nhi"), true);
  assert.equal(loadSaved(storage, STORAGE_KEYS.doc), "# Notes\n\nhi");
});

test("an empty document is saved, not treated as missing", () => {
  const storage = memoryStorage();
  saveTo(storage, STORAGE_KEYS.doc, "");
  assert.equal(loadSaved(storage, STORAGE_KEYS.doc), "");
});

test("storage that throws or is missing never breaks the editor", () => {
  assert.equal(loadSaved(throwingStorage, STORAGE_KEYS.doc), null);
  assert.equal(saveTo(throwingStorage, STORAGE_KEYS.doc, "x"), false);
  assert.equal(loadSaved(null, STORAGE_KEYS.doc), null);
  assert.equal(saveTo(null, STORAGE_KEYS.doc, "x"), false);
});

test("startingTheme prefers a valid saved theme over the OS preference", () => {
  assert.equal(startingTheme("light", true), "light");
  assert.equal(startingTheme("dark", false), "dark");
  assert.equal(startingTheme(null, true), "dark");
  assert.equal(startingTheme("purple", false), "light");
});

test("debounce runs once with the latest arguments after a pause", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const calls = [];
  const save = debounce((v) => calls.push(v), 500);
  save("a");
  t.mock.timers.tick(300);
  save("ab");
  t.mock.timers.tick(300);
  assert.deepEqual(calls, []);
  t.mock.timers.tick(200);
  assert.deepEqual(calls, ["ab"]);
});
