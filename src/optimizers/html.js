const { minify } = require('html-minifier')

function optimize (html) {
  return minify(html.trim(), {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    sortAttributes: true,
    sortClassName: true
  })
}

module.exports = { optimize }
