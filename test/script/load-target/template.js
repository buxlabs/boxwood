const { js, Html, Head, Body } = require("../../..")
const { join } = require("path")

const script = js.load(join(__dirname), { target: 'head' })

module.exports = () => {
  return Html([
    Head([]),
    Body([
      script.js
    ])
  ])
}
