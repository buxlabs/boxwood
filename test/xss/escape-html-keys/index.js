const { div, raw } = require("../../..")

module.exports = () => [div({ "><script>alert(1)</script><div foo": "" })]
