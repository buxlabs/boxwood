const { join } = require("path")
const {
  component,
  css,
  js,
  Body,
  Button,
  Div,
  H1,
  Head,
  Html,
  Span,
  Title,
} = require("../../..")

const styles = css.load(__dirname)

/*
 * The same component three times on one page. Every other fixture renders a
 * single instance, so the querySelectorAll loop in each of them happens to run
 * once and nothing checks that. State belongs to an instance, not to a
 * component, and the script that drives it is emitted once for all three.
 */
const Counter = component(
  ({ start = 0 }) => {
    return Div({ class: styles.counter, "data-counter": "" }, [
      Span({ class: styles.value, "data-value": "" }, String(start)),
      Button(
        { class: styles.increment, "data-increment": "", type: "button" },
        "+1",
      ),
    ])
  },
  { styles, scripts: [js.load(join(__dirname, "client.js"))] },
)

module.exports = component(({ starts }) => {
  return Html([
    Head([Title("Counters")]),
    Body([H1("Counters"), ...starts.map((start) => Counter({ start }))]),
  ])
})
