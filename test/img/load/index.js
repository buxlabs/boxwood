const { img } = require("../../..")
const { join } = require("path")

const png = img.load(join(__dirname, "square.png"))
const svg = img.load(join(__dirname, "line.svg"))
const jpg = img.load(join(__dirname, "square.jpg"))
const jpeg = img.load(join(__dirname, "square.jpeg"))

module.exports = () => {
  return [png(), svg(), jpg(), jpeg()]
}
