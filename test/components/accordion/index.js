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
        const accordions = document.querySelector('.${styles.accordion}')
        accordions.forEach(accordion => {
          accordion.addEventListener('click', function () {
            const sibling = this.nextElement
            sibling.classList.toggle('${styles.hidden}')
          })
        })
      `,
    ],
  }
)
