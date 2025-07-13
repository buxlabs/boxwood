const { Doctype, Html, Head, Body, Title, H1, P } = require("../../..")
const accordion = require("../../components/accordion")

module.exports = () => {
  return [
    Doctype(),
    Html([
      Head([Title("Documentation")]),
      Body([
        H1("Documentation"),
        P("This is the documentation page."),
        accordion(
          { title: "Accordion" },
          "This is the content of the accordion."
        ),
      ]),
    ]),
  ]
}
