class State {
  constructor (options = {}) {
    this.cache = options
  }
  toggle (key) {
    this.cache[key] = !this.cache[key]
    return this.cache[key]
  }
  get (key) {
    return this.cache[key]
  }
  set (key, value) {
    this.cache[key] = value
    return value
  }
}

module.exports = State
