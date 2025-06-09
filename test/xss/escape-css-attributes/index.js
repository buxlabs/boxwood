const { div } = require("../../..")

module.exports = () =>
  div({ style: { background: 'url("javascript:alert(1)")' } })
