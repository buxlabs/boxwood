let index = 0
const map = new Map()

function createHash(string) {
  if (map.has(string)) {
    return map.get(string)
  }
  index++
  const hash = "c" + index
  map.set(string, hash)
  return hash
}

module.exports = {
  createHash,
}
