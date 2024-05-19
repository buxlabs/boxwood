const { doctype, html, head, body, title, h1, p } = require("../../..")
const accordion = require("../../components/accordion")

module.exports = () => {
  return [
    doctype(),
    html([
      head([title("Documentation")]),
      body([
        h1("Documentation"),
        p("This is the documentation page."),
        accordion(
          { title: "Accordion" },
          "This is the content of the accordion."
        ),
      ]),
    ]),
  ]
}
