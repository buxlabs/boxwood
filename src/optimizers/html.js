const { minify } = require('html-minifier')

function optimize (html) {
  return minify(html.trim(), {
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    sortAttributes: true,
    sortClassName: true,
    minifyCSS: true,
    minifyJS: true
  })
}

module.exports = { optimize }
