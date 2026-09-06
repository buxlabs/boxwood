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
 * client, rendered on the server with its initial value. Written by hand
 * today, so that the behaviour is pinned down before any of it becomes a
 * library feature.
 */
module.exports = component(
  ({ start = 0 }) => {
    return Html([
      Head([Title("Counter")]),
      Body([
        H1("Counter"),
        Div({ class: styles.counter }, [
          Span({ class: styles.value }, String(start)),
          Button({ class: styles.increment, type: "button" }, "+1"),
        ]),
      ]),
    ])
  },
  {
    styles,
    scripts: [
      js`
        document.querySelectorAll('.${styles.counter}').forEach(function (counter) {
          // The bundle may run again on a document it has already wired up -
          // a soft navigation, a swapped in fragment, an accidental second
          // include. Listeners must not stack.
          if (counter.dataset.ready) return
          counter.dataset.ready = 'true'

          const value = counter.querySelector('.${styles.value}')
          const button = counter.querySelector('.${styles.increment}')
          let count = Number(value.textContent)
          button.addEventListener('click', function () {
            count += 1
            value.textContent = String(count)
          })
        })
      `,
    ],
  }
)
