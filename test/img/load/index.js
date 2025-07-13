const { Img } = require("../../..")
const { join } = require("path")

const png = Img.load(join(__dirname, "square.png"))
const svg = Img.load(join(__dirname, "line.svg"))
const jpg = Img.load(join(__dirname, "square.jpg"))
const jpeg = Img.load(join(__dirname, "square.jpeg"))

module.exports = () => {
  return [png(), svg(), jpg(), jpeg()]
}
