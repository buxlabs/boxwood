const { parseDefaults } = require('himalaya')
const { VOID_TAGS } = require('../enum')

module.exports = function defaults (source, options) {
  const voidTags = VOID_TAGS.concat(parseDefaults.voidTags).filter(tag => {
    const regexp = new RegExp(`<import\\s+${tag}\\s+`)
    return !regexp.test(source)
  })
  // we could also potentially decide if the tag is self closing (void)
  // based on the existence of a slot inside of the component
  // right now every imported component must use />
  // another option is that the user could specify it, e.g. by:
  // - passing global options,
  // - setting it as an attribute on the import tag
  return { ...parseDefaults, voidTags, ...options }
}
