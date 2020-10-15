class Features {
  constructor (options) {
    this.options = options
    Object.assign(this, options)
  }
  disable (feature) {
    this[feature] = false
  }
  enable (feature) {
    this[feature] = true
  }
  disabled (feature) {
    return !this[feature]
  }
  enabled (feature) {
    return this[feature]
  }
  each (callback) {
    Object.keys(this.options).forEach(callback)
  }
}

module.exports = Features
