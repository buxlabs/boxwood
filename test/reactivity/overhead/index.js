const { component, js, Body, Div, Head, Html, Title } = require("../../..")

const source = require("./script")

/*
 * Nothing about this page is interesting except what does not end up in it.
 * A bundle is the authored code and nothing else - no runtime, no bootstrap,
 * no scaffolding. When reactivity lands, the temptation to always inject a
 * little something is exactly what this fixture is here to catch.
 */
module.exports = component(
  () => {
    return Html([Head([Title("Overhead")]), Body([Div("hello")])])
  },
  { scripts: [js`${source}`] }
)
