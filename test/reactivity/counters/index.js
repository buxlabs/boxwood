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
    return Div({ class: styles.counter }, [
      Span({ class: styles.value }, String(start)),
      Button({ class: styles.increment, type: "button" }, "+1"),
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

module.exports = component(({ starts }) => {
  return Html([
    Head([Title("Counters")]),
    Body([H1("Counters"), ...starts.map((start) => Counter({ start }))]),
  ])
})
