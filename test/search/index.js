const { Div, Ul, Li, P } = require("../..")

module.exports = function ({ count, results }) {
  return Div({ class: "search" }, [
    Div({ class: "loader" }, "Loading..."),
    Div({ class: "results" }, [
      P(`${count} results`),
      ...results.map((result) => [
        Div({ class: "title" }, result.title),
        Div({ class: "description" }, result.description),
        result.featured && Div({ class: "highlight" }, "Featured!"),
        result.sizes.length && Ul(result.sizes.map((size) => Li(size))),
      ]),
    ]),
  ])
}
