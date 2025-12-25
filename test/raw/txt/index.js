const { raw } = require("../../..")
const { join } = require("path")

const content = raw.load(join(__dirname, "content.txt"))

module.exports = () => {
  return content
}
