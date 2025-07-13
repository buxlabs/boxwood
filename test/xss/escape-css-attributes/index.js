const { Div } = require("../../..")

module.exports = () =>
  Div({ style: { background: 'url("javascript:alert(1)")' } })
