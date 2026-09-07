const { component, js, Body, Div, H1, Head, Html, Title } = require("../../..")

/*
 * js.load has always been able to say target: "head". A tagged template takes
 * no options, so an inline script could only ever land in the body - js.head
 * is the counterpart, for code that has to run before the body is parsed.
 */
module.exports = component(
  () => {
    return Html([
      Head([Title("Inline target")]),
      Body([H1("Inline target"), Div({ id: "output" })]),
    ])
  },
  {
    scripts: [
      js.head`window.theme = "dark"`,
      js.head`window.locale = "pl"`,
      js`document.querySelector("#output").textContent = window.theme + "/" + window.locale`,
    ],
  },
)
