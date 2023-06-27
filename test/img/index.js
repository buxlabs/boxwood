const { img } = require("../..")

const line = img.load(__dirname, "line.png")

module.exports = () => {
  return line()
}
