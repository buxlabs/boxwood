module.exports = class Component {
  constructor () {

  }
  serialize () {
    return {
      name: '',
      source: '',
      path: '',
      files: [],
      tree: {},
      warnings: []
    }
  }
}
