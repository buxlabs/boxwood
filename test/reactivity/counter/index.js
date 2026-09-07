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
 * The smallest possible piece of reactivity - a single number owned by the
 * client, rendered on the server with its initial value.
 *
 * Classes carry the styling and data attributes are the script's hooks. That
 * separation is what lets the behaviour live in client.js: with no scoped
 * class name to interpolate, there is nothing a template literal was needed
 * for, and a class that has no rule in index.css can no longer take the
 * script down with it.
 *
 * Reasoning lives here rather than in client.js, because a loaded script is
 * emitted verbatim - every comment in it is shipped to the browser, and this
 * file is not.
 */
module.exports = component(
  ({ start = 0 }) => {
    return Html([
      Head([Title("Counter")]),
      Body([
        H1("Counter"),
        Div({ class: styles.counter, "data-counter": "" }, [
          Span({ class: styles.value, "data-value": "" }, String(start)),
          Button(
            { class: styles.increment, "data-increment": "", type: "button" },
            "+1",
          ),
        ]),
      ]),
    ])
  },
  { styles, scripts: [js.load(join(__dirname, "client.js"))] },
)
