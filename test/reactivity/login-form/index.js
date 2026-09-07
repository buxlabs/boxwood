const { join } = require("path")
const {
  component,
  css,
  js,
  Body,
  Button,
  Form,
  H1,
  Head,
  Html,
  Input,
  Label,
  P,
  Title,
} = require("../../..")

const styles = css.load(__dirname)

/*
 * A login form is the smallest realistic case that needs every piece of
 * reactivity at once - derived state (the submit button follows the two
 * inputs), conditional rendering (the error message) and text interpolation
 * (the status line). Written by hand today, so that the behaviour is pinned
 * down before any of it becomes a library feature.
 */
module.exports = component(
  () => {
    return Html([
      Head([Title("Login")]),
      Body([
        H1("Login"),
        Form({ class: styles.form, "data-form": "", novalidate: true }, [
          Label({ for: "email" }, "Email"),
          Input({
            id: "email",
            name: "email",
            type: "email",
            class: styles.input,
          }),
          Label({ for: "password" }, "Password"),
          Input({
            id: "password",
            name: "password",
            type: "password",
            class: styles.input,
          }),
          P({ class: styles.error, "data-error": "", "data-hidden": "" }),
          Button(
            {
              type: "submit",
              class: styles.submit,
              "data-submit": "",
              disabled: true,
            },
            "Sign in",
          ),
        ]),
        P({ class: styles.status, "data-status": "" }),
      ]),
    ])
  },
  {
    styles,
    scripts: [js.load(join(__dirname, "client.js"))],
  },
)
