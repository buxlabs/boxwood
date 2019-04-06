module.exports = class Component {
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
