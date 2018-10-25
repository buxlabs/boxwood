const { equal } = require('assert')
const compile = require('../helpers/compile')

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

equal(compile('<img src="../fixtures/images/placeholder.svg" size="1600x800">', {
  paths: [__dirname]
})({}, html => html), '<img src="../fixtures/images/placeholder.svg" width="1600" height="800">')

equal(compile('<img src="../fixtures/images/placeholder.jpg" size="400x400">', {
  paths: [__dirname]
})({}, html => html), '<img src="../fixtures/images/placeholder.jpg" width="400" height="400">')

console.timeEnd('image-size')
