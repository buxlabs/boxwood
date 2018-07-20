const { equal, throws } = require('assert')
const { compile } = require('../..')

console.time('svg')

equal(compile('<svg from="../fixtures/svg/rectangle.svg" />', { paths: [__dirname] })({}, html => html), '<svg width="400" height="100"><rect width="400" height="100" style="fill:rgb(0,0,255);stroke-width:10;stroke:rgb(0,0,0)"></rect></svg>')
equal(compile('<svg from="../fixtures/svg/stroke.svg" />', { paths: [__dirname] })({}, html => html), '<svg height="80" width="300"><g fill="none"><path stroke="red" d="M5 20 l215 0"></path></g></svg>')

throws(function () {
  compile(`<svg from=''/><div>`, { paths: [__dirname] })
}, /Attribute empty on the svg tag: from\./)

throws(function () {
  compile(`<svg from='../circle.svg'/><div>`, {})
}, /Compiler option is undefined: paths\./)

throws(function () {
  compile(`<svg from='../circle.svg'/><div>`, { paths: [] })
}, /Asset not found: \.\.\/circle\.svg/)

console.timeEnd('svg')
