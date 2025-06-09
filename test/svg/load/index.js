const { div, svg, tag } = require("../../..")
const { join } = require("path")

const line = svg.load(join(__dirname, "line.svg"))

module.exports = () => {
  return div([line, svg([tag("rect")])])
}
