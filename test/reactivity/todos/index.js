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
  Li,
  P,
  Span,
  Title,
  Ul,
} = require("../../..")

const styles = css.load(__dirname)

/*
 * A list is where a template library and a reactive one stop agreeing. The
 * initial items are rendered on the server, everything after that is built by
 * hand in the browser - so the markup of a single item exists twice, once here
 * and once as a string in the script below. Keeping those two in sync is the
 * job a list feature would take over.
 *
 * Clicks are delegated to the list, because items added later were never
 * around when listeners were attached.
 */
module.exports = component(
  ({ todos }) => {
    return Html([
      Head([Title("Todos")]),
      Body([
        H1("Todos"),
        Form({ id: "new-todo-form" }, [
          Input({ id: "new-todo", name: "description", autocomplete: "off" }),
          Button({ type: "submit" }, "Add"),
        ]),
        Ul(
          { class: styles.list },
          todos.map((todo) =>
            Li({ class: todo.done ? [styles.item, styles.done] : styles.item }, [
              Input({
                type: "checkbox",
                "data-action": "toggle",
                checked: todo.done,
              }),
              Span(todo.description),
              Button({ type: "button", "data-action": "remove" }, "Remove"),
            ])
          )
        ),
        P(
          {
            class: todos.length
              ? [styles.empty, styles.hidden]
              : styles.empty,
          },
          "Nothing to do."
        ),
        // Rendered on the server too, so there is no flash of an empty count.
        // The client recomputes the same value on load.
        Span(
          { class: styles.remaining },
          `${todos.filter((todo) => !todo.done).length} remaining`
        ),
      ]),
    ])
  },
  {
    styles,
    scripts: [
      js`
        document.querySelectorAll('.${styles.list}').forEach(function (list) {
          // The bundle may run again on a document it has already wired up -
          // a soft navigation, a swapped in fragment, an accidental second
          // include. Listeners must not stack.
          if (list.dataset.ready) return
          list.dataset.ready = 'true'

          const form = document.querySelector('#new-todo-form')
          const input = document.querySelector('#new-todo')
          const remaining = document.querySelector('.${styles.remaining}')
          const empty = document.querySelector('.${styles.empty}')

          function sync() {
            const items = list.querySelectorAll('.${styles.item}')
            let count = 0
            items.forEach(function (item) {
              if (!item.classList.contains('${styles.done}')) count += 1
            })
            remaining.textContent = count + ' remaining'
            empty.classList.toggle('${styles.hidden}', items.length > 0)
          }

          function create(description) {
            const item = document.createElement('li')
            item.className = '${styles.item}'
            item.innerHTML =
              '<input type="checkbox" data-action="toggle">' +
              '<span></span>' +
              '<button type="button" data-action="remove">Remove</button>'
            // textContent, so a description is never read as markup
            item.querySelector('span').textContent = description
            return item
          }

          form.addEventListener('submit', function (event) {
            event.preventDefault()
            const description = input.value.trim()
            if (description === '') return
            list.appendChild(create(description))
            input.value = ''
            sync()
          })

          list.addEventListener('change', function (event) {
            if (event.target.getAttribute('data-action') !== 'toggle') return
            const item = event.target.closest('.${styles.item}')
            item.classList.toggle('${styles.done}', event.target.checked)
            sync()
          })

          list.addEventListener('click', function (event) {
            if (event.target.getAttribute('data-action') !== 'remove') return
            event.target.closest('.${styles.item}').remove()
            sync()
          })

          sync()
        })
      `,
    ],
  }
)
