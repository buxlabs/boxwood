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
        Form({ class: styles.form, novalidate: true }, [
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
          P({ class: [styles.error, styles.hidden] }),
          Button({ type: "submit", class: styles.submit, disabled: true }, "Sign in"),
        ]),
        P({ class: styles.status }),
      ]),
    ])
  },
  {
    styles,
    scripts: [
      js`
        document.querySelectorAll('.${styles.form}').forEach(function (form) {
          // The bundle may run again on a document it has already wired up -
          // a soft navigation, a swapped in fragment, an accidental second
          // include. Listeners must not stack.
          if (form.dataset.ready) return
          form.dataset.ready = 'true'

          const email = form.querySelector('#email')
          const password = form.querySelector('#password')
          const error = form.querySelector('.${styles.error}')
          const submit = form.querySelector('.${styles.submit}')
          const status = document.querySelector('.${styles.status}')

          function showError(message) {
            error.textContent = message
            error.classList.remove('${styles.hidden}')
          }

          function clearError() {
            error.textContent = ''
            error.classList.add('${styles.hidden}')
          }

          function sync() {
            submit.disabled = email.value.trim() === '' || password.value.trim() === ''
          }

          form.addEventListener('input', function () {
            clearError()
            sync()
          })

          form.addEventListener('submit', function (event) {
            event.preventDefault()
            if (!email.value.includes('@')) {
              showError('Enter a valid email address')
              return
            }
            clearError()
            status.textContent = 'Signed in as ' + email.value
          })

          sync()
        })
      `,
    ],
  }
)
