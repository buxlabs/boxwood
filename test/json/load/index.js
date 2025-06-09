const { json } = require("../../..")
const { join } = require("path")

const file = json.load(join(__dirname, "broken.json"))

module.exports = () => {
  return [file.foo]
}
