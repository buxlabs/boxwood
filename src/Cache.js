class Cache {
  constructor () {
    this.memory = {}
  }

  set (key, value) {
    this.memory[key] = value
  }

  get (key) {
    return this.memory[key]
  }

  has (key) {
    return !!this.get(key)
  }

  remove (key) {
    delete this.memory[key]
  }
}

module.exports = Cache
