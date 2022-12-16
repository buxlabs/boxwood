const { css, div } = require('../../../../..')
const styles = css.load(__dirname, 'index.css')

module.exports = () => {
  return [
    div({ class: styles.sidebar }, []),
    styles.css
  ]
}
