const { script } = require("../../..")

module.exports = () => {
  return [script({ src: "https://foo.bar", async: true })]
}
