const test = require("node:test")
const assert = require("node:assert")
const { i18n } = require("../..")

test("i18n: should return correct translation when all parameters are valid", () => {
  const translations = {
    greeting: {
      en: "Hello",
      pl: "Cześć",
      es: "Hola",
    },
    farewell: {
      en: "Goodbye",
      pl: "Do widzenia",
    },
  }

  const translate = i18n(translations)

  assert.strictEqual(translate("en", "greeting"), "Hello")
  assert.strictEqual(translate("pl", "greeting"), "Cześć")
  assert.strictEqual(translate("es", "greeting"), "Hola")
  assert.strictEqual(translate("en", "farewell"), "Goodbye")
})

test("i18n: should throw TranslationError when key is undefined", () => {
  const translations = {
    greeting: {
      en: "Hello",
      pl: "Cześć",
    },
  }

  const translate = i18n(translations)

  let error
  try {
    translate("en")
  } catch (e) {
    error = e
  }

  assert(error)
  assert(error.message.includes("TranslationError"))
  assert(error.message.includes("key is undefined"))
})

test("i18n: should throw TranslationError when language is undefined", () => {
  const translations = {
    greeting: {
      en: "Hello",
      pl: "Cześć",
    },
  }

  const translate = i18n(translations)

  let error
  try {
    translate(undefined, "greeting")
  } catch (e) {
    error = e
  }

  assert(error)
  assert(error.message.includes("TranslationError"))
  assert(error.message.includes("language is undefined"))
})

test("i18n: should throw TranslationError when both language and key are undefined", () => {
  const translations = {
    greeting: {
      en: "Hello",
    },
  }

  const translate = i18n(translations)

  let error
  try {
    translate()
  } catch (e) {
    error = e
  }

  assert(error)
  assert(error.message.includes("TranslationError"))
  assert(error.message.includes("key is undefined"))
})

test("i18n: should throw TranslationError when translation key does not exist", () => {
  const translations = {
    greeting: {
      en: "Hello",
      pl: "Cześć",
    },
  }

  const translate = i18n(translations)

  let error
  try {
    translate("en", "nonexistent")
  } catch (e) {
    error = e
  }

  assert(error)
  assert(error.message.includes("TranslationError"))
  assert(error.message.includes("[nonexistent][en]"))
  assert(error.message.includes("is undefined"))
})

test("i18n: should throw TranslationError when language does not exist for key", () => {
  const translations = {
    greeting: {
      en: "Hello",
      pl: "Cześć",
    },
  }

  const translate = i18n(translations)

  let error
  try {
    translate("fr", "greeting")
  } catch (e) {
    error = e
  }

  assert(error)
  assert(error.message.includes("TranslationError"))
  assert(error.message.includes("[greeting][fr]"))
  assert(error.message.includes("is undefined"))
})

test("i18n: should handle empty translations object", () => {
  const translations = {}
  const translate = i18n(translations)

  let error
  try {
    translate("en", "greeting")
  } catch (e) {
    error = e
  }

  assert(error)
  assert(error.message.includes("TranslationError"))
  assert(error.message.includes("[greeting][en]"))
})

test("i18n: should handle null as translation value (edge case)", () => {
  const translations = {
    greeting: {
      en: "Hello",
      pl: null,
    },
  }

  const translate = i18n(translations)

  assert.strictEqual(translate("pl", "greeting"), null)
})

test("i18n: should handle empty string values", () => {
  const translations = {
    greeting: {
      en: "",
      pl: "Cześć",
    },
  }

  const translate = i18n(translations)

  assert.strictEqual(translate("en", "greeting"), "")
})

test("i18n: should handle numeric zero as translation value", () => {
  const translations = {
    count: {
      en: 0,
      pl: 100,
    },
  }

  const translate = i18n(translations)

  assert.strictEqual(translate("en", "count"), 0)
})

test("i18n: should handle boolean false as translation value", () => {
  const translations = {
    flag: {
      en: false,
      pl: true,
    },
  }

  const translate = i18n(translations)

  assert.strictEqual(translate("en", "flag"), false)
})

test("i18n: should throw when translation value is explicitly undefined", () => {
  const translations = {
    greeting: {
      en: "Hello",
      pl: undefined,
    },
  }

  const translate = i18n(translations)

  let error
  try {
    translate("pl", "greeting")
  } catch (e) {
    error = e
  }

  assert(error)
  assert(error.message.includes("TranslationError"))
  assert(error.message.includes("[greeting][pl]"))
})

test("i18n: should work with special characters in keys", () => {
  const translations = {
    "user.profile.title": {
      en: "Profile",
      pl: "Profil",
    },
  }

  const translate = i18n(translations)

  assert.strictEqual(translate("en", "user.profile.title"), "Profile")
})

test("i18n: should provide helpful error with actual key and language names", () => {
  const translations = {
    "user.settings": {
      en: "Settings",
      de: "Einstellungen",
    },
  }

  const translate = i18n(translations)

  let error
  try {
    translate("fr", "user.settings")
  } catch (e) {
    error = e
  }

  assert(error)
  assert(error.message.includes("user.settings"))
  assert(error.message.includes("fr"))
})

test("i18n: should handle null key (edge case)", () => {
  const translations = {
    greeting: {
      en: "Hello",
    },
  }

  const translate = i18n(translations)

  let error
  try {
    translate("en", null)
  } catch (e) {
    error = e
  }

  assert(error)
  assert(error.message.includes("TranslationError"))
})

test("i18n: should handle null language (edge case)", () => {
  const translations = {
    greeting: {
      en: "Hello",
    },
  }

  const translate = i18n(translations)

  let error
  try {
    translate(null, "greeting")
  } catch (e) {
    error = e
  }

  assert(error)
  assert(error.message.includes("TranslationError"))
})

test("i18n: error message format should match existing tests", () => {
  const translations = {
    foo: {
      pl: "bar",
      en: "baz",
    },
  }

  const translate = i18n(translations)

  let error1
  try {
    translate("en", "bar")
  } catch (e) {
    error1 = e
  }
  assert(error1)
  assert(
    error1.message.includes(
      "TranslationError: translation [bar][en] is undefined",
    ),
  )

  let error2
  try {
    translate("en")
  } catch (e) {
    error2 = e
  }
  assert(error2)
  assert(error2.message.includes("TranslationError: key is undefined"))

  let error3
  try {
    translate(undefined, "foo")
  } catch (e) {
    error3 = e
  }
  assert(error3)
  assert(error3.message.includes("TranslationError: language is undefined"))
})
