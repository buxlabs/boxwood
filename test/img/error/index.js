const { img } = require("../../..")

const file = img.load(__dirname, ".env")

module.exports = () => {
  return [file()]
}
