const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("i18n is going to throw when key is undefined", async () => {
  const { template } = await compile(__dirname)
  let error
  try {
    template({ language: "en" })
  } catch (exception) {
    error = exception
  }
  assert(
    error.message.includes(
      "TranslationError: translation [bar][en] is undefined"
    )
  )
})
