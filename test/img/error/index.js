const { Img } = require("../../..")
const { join } = require("path")

const file = Img.load(join(__dirname, ".env"))

module.exports = () => {
  return [file()]
}
