const { raw } = require("../../..")
const { join } = require("path")

const content = raw.load(join(__dirname, "content.html"))

module.exports = () => {
  return content
}
