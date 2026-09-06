const {
  component,
  css,
  js,
  Body,
  Div,
  H1,
  Head,
  Html,
  Input,
  Li,
  P,
  Title,
  Ul,
} = require("../../..")

const styles = css.load(__dirname)

/*
 * Search is the first fixture where state changes without anyone clicking
 * anything. Three things have to be pinned down before a reactive layer can
 * own them: the debounce (one request per pause, not one per keystroke), the
 * states in between (idle, loading, results, empty, error) and the guard that
 * throws away a response the user has already moved past.
 */
module.exports = component(
  ({ results }) => {
    return Html([
      Head([Title("Search")]),
      Body([
        H1("Search"),
        Div({ class: styles.search }, [
          Input({ id: "query", type: "search", autocomplete: "off" }),
          P({ class: [styles.loader, styles.hidden] }, "Loading..."),
          P({ class: [styles.message, styles.hidden] }),
          Ul(
            { class: styles.results },
            results.map((result) => Li({ class: styles.result }, result.title))
          ),
        ]),
      ]),
    ])
  },
  {
    styles,
    scripts: [
      js`
        document.querySelectorAll('.${styles.search}').forEach(function (search) {
          // The bundle may run again on a document it has already wired up -
          // a soft navigation, a swapped in fragment, an accidental second
          // include. Listeners must not stack.
          if (search.dataset.ready) return
          search.dataset.ready = 'true'

          const input = search.querySelector('#query')
          const loader = search.querySelector('.${styles.loader}')
          const message = search.querySelector('.${styles.message}')
          const results = search.querySelector('.${styles.results}')

          let timer = null
          // Every request takes a number. Only the newest one may write to the
          // page - a slow response for an older query is dropped on arrival.
          let latest = 0

          function toggle(element, on) {
            element.classList.toggle('${styles.hidden}', !on)
          }

          function render(items) {
            results.innerHTML = ''
            items.forEach(function (item) {
              const result = document.createElement('li')
              result.className = '${styles.result}'
              // textContent, so a title is never read as markup
              result.textContent = item.title
              results.appendChild(result)
            })
          }

          function say(text) {
            message.textContent = text
            toggle(message, true)
          }

          function reset() {
            render([])
            toggle(loader, false)
            toggle(message, false)
          }

          function request(query) {
            const id = ++latest
            render([])
            toggle(message, false)
            toggle(loader, true)
            window
              .fetch('/search?q=' + encodeURIComponent(query))
              .then(function (response) {
                return response.json()
              })
              .then(function (data) {
                if (id !== latest) return
                toggle(loader, false)
                render(data.results)
                if (data.results.length === 0) say('No results for ' + query)
              })
              .catch(function () {
                if (id !== latest) return
                toggle(loader, false)
                say('Something went wrong')
              })
          }

          input.addEventListener('input', function () {
            clearTimeout(timer)
            const query = input.value.trim()
            if (query === '') {
              // Nothing in flight may land after the field is cleared.
              latest += 1
              reset()
              return
            }
            timer = setTimeout(function () {
              request(query)
            }, 20)
          })
        })
      `,
    ],
  }
)
