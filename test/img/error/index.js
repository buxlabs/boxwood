const { img } = require("../../..")
const { join } = require("path")

const file = img.load(join(__dirname, ".env"))

module.exports = () => {
  return [file()]
}
