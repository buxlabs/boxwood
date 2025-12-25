const test = require("node:test")
const assert = require("node:assert")
const { tag } = require("../../..")

test("attributes: prevents prototype pollution via __proto__", () => {
  const maliciousAttrs = {
    __proto__: { polluted: "true" },
    class: "safe"
  }
  
  const result = tag("div", maliciousAttrs, "content")
  
  // Should not pollute Object prototype
  assert.strictEqual(Object.prototype.polluted, undefined, "Should not pollute Object.prototype")
})

test("attributes: prevents prototype pollution via constructor", () => {
  const maliciousAttrs = {
    constructor: { prototype: { polluted: "true" } },
    class: "safe"
  }
  
  const result = tag("div", maliciousAttrs, "content")
  
  // Should not pollute Object prototype
  assert.strictEqual(Object.prototype.polluted, undefined, "Should not pollute Object.prototype")
})

test("attributes: prevents prototype pollution via prototype", () => {
  const maliciousAttrs = {
    prototype: { polluted: "true" },
    class: "safe"
  }
  
  const result = tag("div", maliciousAttrs, "content")
  
  // Should not pollute Object prototype
  assert.strictEqual(Object.prototype.polluted, undefined, "Should not pollute Object.prototype")
})