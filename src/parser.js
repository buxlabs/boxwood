const { parse, parseDefaults } = require('himalaya')

module.exports = {
  parse (source, options) {
    const voidTags = parseDefaults.voidTags.filter(tag => !source.includes(`<import ${tag} `)) // TODO use regexp
    // we could also potentially decide if the tag is self closing (void)
    // based on the existence of a slot inside of the component
    // right now every imported component must use />
    // another option is that the user could specify it, e.g. by:
    // - passing global options,
    // - setting it as an attribute on the import tag
    return parse(source, { ...parseDefaults, voidTags, ...options })
  }
}
