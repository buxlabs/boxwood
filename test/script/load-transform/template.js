const { js, Html, Head, Body } = require("../../..")
const { join } = require("path")

const script = js.load(join(__dirname), {
  transform: (code) => code.replace('original', 'transformed')
})

module.exports = () => {
  return Html([
    Head([]),
    Body([
      script.js
    ])
  ])
}
