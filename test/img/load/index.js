const { img } = require("../../..")

const png = img.load(__dirname, "square.png")
const svg = img.load(__dirname, "line.svg")
const jpg = img.load(__dirname, "square.jpg")
const jpeg = img.load(__dirname, "square.jpeg")

module.exports = () => {
  return [png(), svg(), jpg(), jpeg()]
}
