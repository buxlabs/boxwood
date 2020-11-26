function tag (name, attributes = {}, children = []) {
  return {
    name,
    attributes,
    children
  }
}

module.exports = tag
