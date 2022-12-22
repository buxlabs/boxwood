const { css, div, js, h3 } = require('../../..')

const styles = css.load(__dirname, 'index.css')

const code = js`
  const accordions = document.querySelector('.${styles.accordion}')
  accordions.forEach(accordion => {
    accordion.addEventListener('click', function () {
      const sibling = this.nextElement
      sibling.classList.toggle('${styles.content}')
    })
  })
`

module.exports = ({ title }, children) => {
  return [
    h3({ class: styles.accordion }, title),
    div({ class: [styles.content, styles.hidden] }, children),
    styles.css,
    code.js,
  ]
}
