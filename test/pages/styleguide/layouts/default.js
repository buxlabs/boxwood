const { component, html, head, tag, meta, style, body } = require("../../../..")

module.exports = component(({ title, description }, children) => {
  return html([
    head([
      title && tag("title", title),
      style("body { background: #ccc; }"),
      description && meta({ name: "description", content: description }),
    ]),
    body(children),
  ])
})
