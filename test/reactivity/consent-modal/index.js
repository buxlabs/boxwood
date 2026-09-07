const { join } = require("path")
const {
  component,
  css,
  js,
  Body,
  Button,
  Div,
  Footer,
  H1,
  H2,
  Head,
  Html,
  Input,
  Label,
  P,
  Title,
} = require("../../..")

const styles = css.load(__dirname)

/*
 * The consent modal is the first case where state outlives the page - the
 * decision is read back from storage on the next load - and where two parts
 * of the document that know nothing about each other have to stay in sync:
 * the footer button reopens the modal. Written by hand today, so that the
 * behaviour is pinned down before any of it becomes a library feature.
 *
 * Classes carry the styling and data attributes are the script's hooks. Ids
 * are left for what ids are actually for: consent-title is referenced by
 * aria-labelledby. Hooks as attributes also mean two modals on one page do
 * not collide, which duplicated ids would.
 */
module.exports = component(
  () => {
    return Html([
      Head([Title("Consent")]),
      Body([
        H1("Consent"),
        Footer([
          Button(
            { type: "button", "data-reopen": "", class: styles.reopen },
            "Cookie settings",
          ),
        ]),
        // Rendered open. The client closes it when a decision is already stored.
        Div(
          {
            class: styles.modal,
            "data-modal": "",
            role: "dialog",
            "aria-modal": true,
            "aria-labelledby": "consent-title",
          },
          [
            H2({ id: "consent-title" }, "Cookies"),
            P("We use cookies to run this site."),
            Div(
              { class: styles.options, "data-options": "", "data-hidden": "" },
              [
                Label([
                  Input({ type: "checkbox", "data-analytics": "" }),
                  "Analytics",
                ]),
                Label([
                  Input({ type: "checkbox", "data-marketing": "" }),
                  "Marketing",
                ]),
              ],
            ),
            Div({ class: styles.actions }, [
              Button({ type: "button", "data-manage": "" }, "Manage"),
              Button({ type: "button", "data-reject": "" }, "Reject all"),
              Button({ type: "button", "data-accept": "" }, "Accept all"),
              Button(
                { type: "button", "data-save": "", "data-hidden": "" },
                "Save choices",
              ),
            ]),
          ],
        ),
      ]),
    ])
  },
  {
    styles,
    scripts: [js.load(join(__dirname, "client.js"))],
  },
)
