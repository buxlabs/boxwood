const { css, div } = require('../../..')

const styles = css`
.avatar {
  width: 32px;
  height: 32px;
  display: inline-block;
  line-height: 32px;
  border-radius: 100%;
  vertical-align: top;
}

.image {
  background-size: contain;
}

.text {
  background-color: #e71d68;
  color: white;
  text-align: center;
  font-size: 12px;
}

.avatar + .avatar {
  margin-left: 4px;
}
`

module.exports = ({ image, text }) => {
  if (image) {
    return div({ class: [styles.avatar, styles.image], style: `background-image: url(${image})` }, [])
  }
  return div({ class: [styles.avatar, styles.text] }, text)
}
