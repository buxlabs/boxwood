const { component, json } = require("../../..")
const layout = require("./layouts/default")
const sidebar = require("./partials/sidebar")
const content = require("./partials/content")

const i18n = json.load(__dirname, "index.json")

module.exports = component(
  ({ language, translate }) => {
    return layout({ title: translate("title") }, [
      sidebar(),
      content({ language }),
    ])
  },
  { i18n }
)
