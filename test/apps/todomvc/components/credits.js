const { A, Footer, P } = require("../../../..")
const styles = require("../styles")

module.exports = () =>
  Footer({ class: styles.info }, [
    P("Double-click a todo to edit it"),
    P([
      "Built with ",
      A({ href: "https://github.com/buxlabs/boxwood" }, "boxwood"),
    ]),
    P([
      "Part of ",
      A({ href: "https://todomvc.com" }, "TodoMVC"),
    ]),
  ])
