'use strict'

// basic cache implementation

// ideally the cache should be dependent not only on the key, but also on the options that are passed to the compiler
// you can get a different output depending on the options

// there are other edge cases too:
// - http calls could fail (might want to retry them?)
// - errors and/or warnings could be present (could avoid caching in this case)
// - timeouts?

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
