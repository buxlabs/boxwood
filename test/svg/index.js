const { div, svg, tag } = require("../..")

const line = svg.load(__dirname, "line.svg")

module.exports = () => {
  return div([line, svg([tag("rect")])])
}
