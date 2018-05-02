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
          values.push(string)
          string = ''
        }
      }
      string += character
      if (character === '}') {
        values.push(string)
        string = ''
      }
    })
    values.push(string)
    return values.filter(Boolean)
  },
  getName (name) {
    if (name.endsWith('.bind')) {
      return name.substring(0, name.length - 5)
    }
    return name
  }
}
