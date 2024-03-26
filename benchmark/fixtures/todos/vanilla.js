module.exports = ({ title, subtitle, todos }) => {
  let template = ''
  template += '<h1>' + title + '</h1>'
  template += '<h2>' + subtitle + '</h2>'
  template += '<ul>'
  for (let i = 0, ilen = todos.length; i < ilen; i++) {
    const todo = todos[i]
    template += '<li>' + todo.description + '</li>'
  }
  template += '</ul>'
  return template
}
