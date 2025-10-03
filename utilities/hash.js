if (!global.__boxwood_index__) {
  global.__boxwood_index__ = 0
}

const map = new Map()

function createHash(string) {
  if (map.has(string)) {
    return map.get(string)
  }

  global.__boxwood_index__++
  const hash = "c" + global.__boxwood_index__
  map.set(string, hash)
  return hash
}

module.exports = {
  createHash,
}
