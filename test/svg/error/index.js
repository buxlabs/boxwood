const { div, svg, tag } = require("../../..")

const line = svg.load(__dirname, "line.png")

module.exports = () => {
  return div([line, svg([tag("rect")])])
}
