const compile = require('./src/compile')
const escape = require('./src/vdom/utilities/escape')
const { createRender } = require('./src/render')

module.exports = {
  compile,
  escape,
  createRender
}
