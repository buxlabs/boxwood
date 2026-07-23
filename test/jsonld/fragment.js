const { Div, Script } = require("../..")

// A fragment without html/head - JSON-LD should stay in place, deduplicated
module.exports = () => {
  return Div([
    Script({ type: "application/ld+json" }, '{"@type":"Article"}'),
    Script({ type: "application/ld+json" }, '{"@type":"Article"}'),
  ])
}
