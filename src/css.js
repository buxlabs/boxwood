function addAttribute (attrs, key, value) {
  const index = attrs.findIndex(attr => attr.key === key)
  if (index === -1) {
    attrs.push({ key, value })
  } else {
    attrs[index].value = `${value} ${attrs[index].value}`
  }
}

function attributeToStyle (attrs, attributeNames, styles) {
  const index = attrs.findIndex(attr => attributeNames.includes(attr.key))
  if (index !== -1) {
    attrs.splice(index, 1)
    addAttribute(attrs, 'style', styles)
  }
  return attrs
}

module.exports = { attributeToStyle }
