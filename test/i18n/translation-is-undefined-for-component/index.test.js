const test = require("node:test")
const assert = require("node:assert")
const { compile, TranslationError } = require("../../..")

test("i18n is going to throw if a translation is missing", async () => {
  const { template } = await compile(__dirname)
  let error
  try {
    template({ language: "en" })
  } catch (exception) {
    error = exception
  }
  assert(error instanceof TranslationError)
  assert(
    error.message.includes("translation [bar][en] is undefined for component"),
  )
})
