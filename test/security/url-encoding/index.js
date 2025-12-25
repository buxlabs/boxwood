const { raw } = require("../../..")

module.exports = () => {
  return raw.load(__dirname + "/encoded.html")
}
