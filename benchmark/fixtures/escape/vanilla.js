const { escape } = require("../../..")

module.exports = function ({ foo }) {
  return escape(foo)
}
