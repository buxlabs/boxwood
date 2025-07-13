const { Script } = require("../../..")

module.exports = () => {
  return [Script({ src: "https://foo.bar", async: true })]
}
