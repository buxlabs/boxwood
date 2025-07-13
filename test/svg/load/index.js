const { Div, Svg, tag } = require("../../..")
const { join } = require("path")

const line = Svg.load(join(__dirname, "line.svg"))

module.exports = () => {
  return Div([line, Svg([tag("rect")])])
}
