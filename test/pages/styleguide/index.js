const { component, i18n } = require("../../..")
const layout = require("./layouts/default")
const sidebar = require("./partials/sidebar")
const content = require("./partials/content")

const translate = i18n.load(__dirname, "index.json")

module.exports = component(({ language }) => {
  return layout({ title: translate("en", "title") }, [
    sidebar(),
    content({ language }),
  ])
})
