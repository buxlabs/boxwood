const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("layout renders a doctype", () => {
  const { template } = compile(__dirname)
  const html = template({ language: "en" })
  assert(html.includes("<!DOCTYPE html>"))
})

test("layout renders an html tag with a lang attribute", () => {
  const { template } = compile(__dirname)
  const html = template({ language: "en" })
  assert(html.includes('<html lang="en">'))
})

test("layout renders children", () => {
  const { template } = compile(__dirname)
  const html = template({ language: "en" }, "Hello, world!")
  assert(html.includes("Hello, world!"))
})
