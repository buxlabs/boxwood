const { img } = require("../../..")

const jpg = img.load(__dirname, "not-found.jpg")

module.exports = () => {
  return [jpg()]
}
