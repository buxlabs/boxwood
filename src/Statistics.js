'use strict'

// TODO pure-utilities unique should work for objects
function uniq (array) {
  // @ts-ignore
  return Array.from(new Set(array.map(item => JSON.stringify(item)))).map(JSON.parse)
}

class Statistics {
  constructor () {
    this.components = []
    this.partials = []
    this.images = []
    this.scripts = []
    this.stylesheets = []
    this.translations = []
  }

  concat (name, array) {
    this[name] = this[name].concat(array)
    return this
  }

  merge (statistics) {
    this
      .concat('components', statistics.components)
      .concat('partials', statistics.partials)
      .concat('images', statistics.images)
      .concat('scripts', statistics.scripts)
      .concat('stylesheets', statistics.stylesheets)
      .concat('translations', statistics.translations)
  }

  assets () {
    return uniq([].concat(
      this.components.map(item => item.path),
      this.partials.map(item => item.path),
      this.images.map(item => item.path),
      this.scripts.map(item => item.path),
      this.stylesheets.map(item => item.path),
      this.translations.map(item => item.path)
    ))
  }

  serialize () {
    return {
      components: uniq(this.components),
      partials: uniq(this.partials),
      images: uniq(this.images),
      scripts: uniq(this.scripts),
      stylesheets: uniq(this.stylesheets),
      translations: uniq(this.translations),
      assets: this.assets()
    }
  }
}

module.exports = Statistics
