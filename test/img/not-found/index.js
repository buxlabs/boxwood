const { Img } = require("../../..")
const { join } = require("path")

const jpg = Img.load(join(__dirname, "not-found.jpg"))

module.exports = () => {
  return [jpg()]
}
