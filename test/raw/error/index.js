const { raw } = require("../../..")

const content = raw.load(__dirname, ".env")

module.exports = () => {
  return content
}
