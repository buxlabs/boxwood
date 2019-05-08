class Cache {
  constructor () {
    this.cache = {}
  }

  has (key) {
    return !!this.get(key)
  }

  set (key, value) {
    this.cache[key] = value
  }

  get (key) {
    return this.cache[key]
  }
}

module.exports = Cache
