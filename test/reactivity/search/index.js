const { join } = require("path")
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
        Div({ class: styles.search, "data-search": "" }, [
          Input({ id: "query", type: "search", autocomplete: "off" }),
          P(
            { class: styles.loader, "data-loader": "", "data-hidden": "" },
            "Loading...",
          ),
          P({ class: styles.message, "data-message": "", "data-hidden": "" }),
          Ul(
            { class: styles.results, "data-results": "" },
            results.map((result) => Li({ "data-result": "" }, result.title)),
          ),
        ]),
      ]),
    ])
  },
  {
    styles,
    scripts: [js.load(join(__dirname, "client.js"))],
  },
)
