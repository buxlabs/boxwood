const { doctype, tag, html, head, body, p, a } = require("../../..")

module.exports = ({ title, projects, text }) => {
  return [
    doctype(),
    html([
      head([tag("title", title)]),
      body([
        p(text),
        ...projects.map((project) => {
          return [
            a({ href: project.url }, project.name),
            p(project.description),
          ]
        }),
        projects.length === 0 && "No projects",
      ]),
    ]),
  ]
}
