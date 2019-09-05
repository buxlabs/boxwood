function attributeToStyle (attrs, attributeNames, styles) {
  const index = attrs.findIndex(attr => attributeNames.includes(attr.key))
  if (index !== -1) {
    attrs.splice(index, 1)
    const styleAttributeIndex = attrs.findIndex(attr => attr.key === 'style')
    if (styleAttributeIndex === -1) {
      attrs.push({ key: 'style', value: styles })
    } else {
      const { value } = attrs[styleAttributeIndex]
      attrs[styleAttributeIndex].value = `${styles} ${value}`
    }
  }
  return attrs
}

module.exports = { attributeToStyle }
