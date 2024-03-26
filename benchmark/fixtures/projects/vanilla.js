module.exports = ({ title, projects, text }) => {
  let output =
    "<!DOCTYPE html><html><head><title>" +
    title +
    "</title></head><body><p>" +
    text +
    "</p>"
  projects.forEach((project) => {
    output +=
      '<a href="' +
      project.url +
      '">' +
      project.name +
      "</a><p>" +
      project.description +
      "</p>"
  })
  output += projects.length === 0 ? "No projects" : ""
  output += "</body></html>"
  return output
}
