const { json } = require("../../..")

const file = json.load(__dirname, "broken.json")

module.exports = () => {
  return [file.foo]
}
