'use strict'

module.exports = {
  clone (object) {
    // consider using fast-clone or other lib in the future and see if it improves performance
    return JSON.parse(JSON.stringify(object))
  }
}
