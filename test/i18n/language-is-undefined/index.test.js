const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("i18n is going to throw if the language is not defined in params", async () => {
  const { template } = await compile(__dirname)
  let error
  try {
    template({})
  } catch (exception) {
    error = exception
  }
  assert(
    error.message.includes(
      "TranslationError: language is undefined for component"
    )
  )
})

test("i18n is going to throw if the params are not set", async () => {
  const { template } = await compile(__dirname)
  let error
  try {
    template()
  } catch (exception) {
    error = exception
  }
  assert(
    error.message.includes(
      "TranslationError: language is undefined for component"
    )
  )
})
