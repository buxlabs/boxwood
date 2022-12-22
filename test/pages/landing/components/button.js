const { button, css } = require('../../../..')
const styles = css.load(__dirname, 'button.css')

module.exports = ({ className }, children) => {
  return [
    button({ class: [className, styles.button] }, children),
    styles.css
  ]
}
