const { css, Div } = require("../../..")
const styles = css.load(__dirname)

module.exports = ({ image, text }) => {
  if (image) {
    return Div(
      {
        class: [styles.avatar, styles.image],
        style: `background-image: url(${image})`,
      },
      []
    )
  }
  return Div({ class: [styles.avatar, styles.text] }, text)
}
