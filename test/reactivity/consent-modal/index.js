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
 * Scoped classes carry the styling, ids are the script's hooks - a class that
 * has no rule in index.css would silently render as undefined.
 */
module.exports = component(
  () => {
    return Html([
      Head([Title("Consent")]),
      Body([
        H1("Consent"),
        Footer([
          Button(
            { type: "button", id: "reopen", class: styles.reopen },
            "Cookie settings"
          ),
        ]),
        // Rendered open. The client closes it when a decision is already stored.
        Div(
          {
            class: styles.modal,
            role: "dialog",
            "aria-modal": true,
            "aria-labelledby": "consent-title",
          },
          [
            H2({ id: "consent-title" }, "Cookies"),
            P("We use cookies to run this site."),
            Div({ class: [styles.options, styles.hidden] }, [
              Label([
                Input({ type: "checkbox", id: "analytics" }),
                "Analytics",
              ]),
              Label([
                Input({ type: "checkbox", id: "marketing" }),
                "Marketing",
              ]),
            ]),
            Div({ class: styles.actions }, [
              Button({ type: "button", id: "manage" }, "Manage"),
              Button({ type: "button", id: "reject" }, "Reject all"),
              Button({ type: "button", id: "accept" }, "Accept all"),
              Button(
                { type: "button", id: "save", class: styles.hidden },
                "Save choices"
              ),
            ]),
          ]
        ),
      ]),
    ])
  },
  {
    styles,
    scripts: [
      js`
        document.querySelectorAll('.${styles.modal}').forEach(function (modal) {
          // The bundle may run again on a document it has already wired up -
          // a soft navigation, a swapped in fragment, an accidental second
          // include. Listeners must not stack.
          if (modal.dataset.ready) return
          modal.dataset.ready = 'true'

          const options = modal.querySelector('.${styles.options}')
          const analytics = modal.querySelector('#analytics')
          const marketing = modal.querySelector('#marketing')
          const manage = modal.querySelector('#manage')
          const save = modal.querySelector('#save')
          const reject = modal.querySelector('#reject')
          const accept = modal.querySelector('#accept')
          const reopen = document.querySelector('#reopen')

          function decide(categories) {
            window.localStorage.setItem('consent', categories.join(','))
            modal.classList.add('${styles.hidden}')
          }

          function selected() {
            const categories = []
            if (analytics.checked) categories.push('analytics')
            if (marketing.checked) categories.push('marketing')
            return categories
          }

          manage.addEventListener('click', function () {
            options.classList.remove('${styles.hidden}')
            save.classList.remove('${styles.hidden}')
            manage.classList.add('${styles.hidden}')
          })

          accept.addEventListener('click', function () {
            analytics.checked = true
            marketing.checked = true
            decide(['analytics', 'marketing'])
          })

          reject.addEventListener('click', function () {
            analytics.checked = false
            marketing.checked = false
            decide([])
          })

          save.addEventListener('click', function () {
            decide(selected())
          })

          reopen.addEventListener('click', function () {
            modal.classList.remove('${styles.hidden}')
          })

          const stored = window.localStorage.getItem('consent')
          if (stored !== null) {
            analytics.checked = stored.includes('analytics')
            marketing.checked = stored.includes('marketing')
            modal.classList.add('${styles.hidden}')
          }
        })
      `,
    ],
  }
)
