'use strict'

function classes () {
  const names = []

  for (let i = 0, ilen = arguments.length; i < ilen; i++) {
    const arg = arguments[i]
    if (typeof arg === 'string') {
      names.push(arg)
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (arg[key]) {
          names.push(key)
        }
      }
    }
  }

  return names.join(' ')
}

module.exports = classes
