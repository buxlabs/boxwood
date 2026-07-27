const { component, css, Div, js, H3 } = require("../../..")
const styles = css.load(__dirname)

module.exports = component(
  ({ title }, children) => {
    return [
      H3({ class: styles.accordion }, title),
      Div({ class: [styles.content, styles.hidden] }, children),
    ]
  },
  {
    styles,
    scripts: [
      js`
        document.querySelectorAll('.${styles.accordion}').forEach(function (header) {
          header.addEventListener('click', function () {
            header.nextElementSibling.classList.toggle('${styles.hidden}')
          })
        })
      `,
    ],
  }
)
