const { component, Html, Head, tag, Meta, Style, Body } = require("../../../..")

module.exports = component(({ title, description }, children) => {
  return Html([
    Head([
      title && tag("title", title),
      Style("body { background: #ccc; }"),
      description && Meta({ name: "description", content: description }),
    ]),
    Body(children),
  ])
})
