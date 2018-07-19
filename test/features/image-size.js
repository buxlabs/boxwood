const { equal } = require('assert')
const { compile } = require('../..')

console.time('image-size')

equal(compile('<img src="../fixtures/images/placeholder.png" width="auto" height="auto">', {
  paths: [__dirname]
})({}, html => html), '<img src="../fixtures/images/placeholder.png" width="250" height="250">')

equal(compile('<img src="../fixtures/images/placeholder.jpg" width="auto" height="auto">', {
  paths: [__dirname]
})({}, html => html), '<img src="../fixtures/images/placeholder.jpg" width="250" height="250">')

equal(compile('<img src="../fixtures/images/placeholder.svg" width="auto" height="auto">', {
  paths: [__dirname]
})({}, html => html), '<img src="../fixtures/images/placeholder.svg" width="400" height="100">')

console.timeEnd('image-size')
