module.exports = function walk (node, callback) {
  callback(node)
  if (node.childNodes) {
    let child = node.childNodes[0]
    let i = 0
    while (child) {
      walk(child, callback)
      child = node.childNodes[++i]
    }
  }
}
