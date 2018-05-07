function singlespace (string) {
  return string.replace(/\s\s+/g, ' ')
}

module.exports = {
  singlespace,
  extract (value) {
    let values = []
    let string = ''
    singlespace(value.trim()).split('').forEach(character => {
      if (character === '{') {
        if (string) {
          values.push({ value: string })
          string = ''
        }
      }
      string += character
      if (character === '}') {
        values.push({ value: string })
        string = ''
      }
    })
    values.push({ value: string })
    return values.filter(object => !!object.value)
  },
  getName (name) {
    if (name.endsWith('.bind')) {
      return name.substring(0, name.length - 5)
    }
    return name
  }
}
