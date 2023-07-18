const { img } = require("../..")

const line1 = img.load(__dirname, "line.png")
const line2 = img.load(__dirname, "line.svg")

module.exports = () => {
  return [line1(), line2()]
}
