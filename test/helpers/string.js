module.exports = {
  normalize (string) {
    return string.replace(/[\n+|\s+]/g, '')
  }
}
