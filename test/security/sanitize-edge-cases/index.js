const { raw } = require("../../..")

module.exports = () => {
  return raw.load(__dirname + "/malicious.html")
}
