const { Div, Svg, tag } = require("../../..")

const line = Svg.load(__dirname, "line.png")

module.exports = () => {
  return Div([line, Svg([tag("rect")])])
}
