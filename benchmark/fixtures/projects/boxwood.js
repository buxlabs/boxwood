const { Doctype, tag, Html, Head, Body, P, A } = require("../../..")

module.exports = ({ title, projects, text }) => {
  return [
    Doctype(),
    Html([
      Head([tag("title", title)]),
      Body([
        P(text),
        ...projects.map((project) => {
          return [
            A({ href: project.url }, project.name),
            P(project.description),
          ]
        }),
        projects.length === 0 && "No projects",
      ]),
    ]),
  ]
}
