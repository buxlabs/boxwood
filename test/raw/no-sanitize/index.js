const { raw } = require("../../..")
const { join } = require("path")

const content = raw.load(join(__dirname, "content.html"), { sanitize: false })

module.exports = () => {
  return content
}
