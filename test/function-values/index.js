const { Body, Div, Head, Html, P, Span, Title } = require("../..")

/*
 * A function is a value: it is called, and what it returns is what renders.
 *
 * Two of the names below are `style` and `br` on purpose. render() and walk()
 * both branch on node.name and a function has one, so before this a child
 * called `br` rendered as <br>, one called `count` as <count></count>, and one
 * called `style` pushed undefined into the page's stylesheet.
 */
const count = () => 5
const br = () => "break"
const style = () => "bold"
const script = () => "inline"
const unsafe = () => "<script>alert(1)</script>"

module.exports = () => {
  return Html([
    Head([Title("Function values")]),
    Body([
      // A lone function argument is a child, not attributes.
      Span({ id: "lone" }, count),
      Div({ id: "thunk" }, [() => count() * 2]),
      P({ id: "between" }, ["Count: ", count, " and counting"]),
      P({ id: "named" }, [br, " ", style, " ", script]),
      P({ id: "escaped" }, unsafe),
    ]),
  ])
}
