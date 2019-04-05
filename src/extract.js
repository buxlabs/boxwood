// TODO: Replace with get components name from node.js file
function extractComponentNames (attrs) {
  const omitted = ['{', '}', 'from']
  const keys = attrs.map(attr => attr.key).filter(key => !omitted.includes(key))
  return keys.join('').replace('{', '').replace('}', '').split(/,/g).map(key => key.trim())
}

module.exports = { extractComponentNames }
