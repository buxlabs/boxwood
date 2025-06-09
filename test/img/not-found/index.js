const { img } = require("../../..")
const { join } = require("path")

const jpg = img.load(join(__dirname, "not-found.jpg"))

module.exports = () => {
  return [jpg()]
}
