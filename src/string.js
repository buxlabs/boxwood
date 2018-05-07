function singlespace (string) {
  return string.replace(/\s\s+/g, ' ')
}

module.exports = {
  singlespace,
  extract (value) {
    let objects = []
    let string = ''
    singlespace(value.trim()).split('').forEach(character => {
      if (character === '{') {
        if (string) {
          objects.push({ value: string })
          string = ''
        }
      }
      string += character
      if (character === '}') {
        objects.push({ value: string })
        string = ''
      }
    })
    objects.push({ value: string })
    objects = objects.map(object => {
      let value = object.value
      if (value.startsWith('{') && value.endsWith('}') && value.includes('|')) {
        value = value.substring(1, value.length - 1)
        let parts = value.split('|').map(string => string.trim())
        object.value = `{${parts[0]}}`
        object.modifiers = parts.slice(1)
      }
      return object
    })
    return objects.filter(object => !!object.value)
  },
  getName (name) {
    if (name.endsWith('.bind')) {
      return name.substring(0, name.length - 5)
    }
    return name
  }
}
