const { join } = require("path")
const { component, js, Body, Div, Head, Html, Title } = require("../../..")

const Greeting = component(() => Div({ "data-greeting": "" }), {
  scripts: [js.load(join(__dirname, "client.js"))],
})

const Rival = component(() => Div({ "data-rival": "" }), {
  scripts: [js.load(join(__dirname, "rival.js"))],
})

module.exports = component(() =>
  Html([Head([Title("Imports")]), Body([Greeting(), Rival()])]),
)
