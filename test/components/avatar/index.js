const { css, div } = require('../../..')
const styles = css.load(__dirname, 'index.css')

module.exports = ({ image, text }) => {
  if (image) {
    return div({ class: [styles.avatar, styles.image], style: `background-image: url(${image})` }, [])
  }
  return div({ class: [styles.avatar, styles.text] }, text)
}
