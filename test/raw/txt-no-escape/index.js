const { raw } = require("../../..")
const { join } = require("path")

const content = raw.load(join(__dirname, "content.txt"), { escape: false })

module.exports = () => {
  return content
}
