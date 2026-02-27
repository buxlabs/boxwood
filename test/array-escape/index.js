const { Html, Head, Body, Template } = require("../..")

module.exports = () => {
  return Html([Head(), Body([Template(["<div>A & B</div>"])])])
}
