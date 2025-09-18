function hashDJB2(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

function createHash(str) {
  return hashDJB2(str).slice(0, 6)
}

module.exports = {
  createHash,
}
