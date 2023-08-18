const { raw } = require("../..")

const content = raw.load(__dirname, "content.html")

module.exports = () => {
  return content
}
