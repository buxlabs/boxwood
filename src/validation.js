const { isPlainObject } = require('pure-conditions')

module.exports = {
  validateOptions: ({ inline, compilers, paths, languages, cache, aliases, styles }) => {
    return [
      ...arePathsValid(paths),
      ...isInlineValid(inline),
      ...areCompilersValid(compilers),
      ...areLanguagesValid(languages),
      ...isCacheValid(cache),
      ...areAliasesValid(aliases),
      ...areStylesValid(styles)
    ]
  }
}

function arePathsValid (paths) {
  if (!Array.isArray(paths)) return ['Compiler option "paths" must be an array']
  if (paths.some(path => typeof path !== 'string')) {
    return ['Compiler option "paths" must contain only strings']
  }
  if (paths.some(path => path === '')) {
    return ['Compiler option "paths" cannot contain empty strings']
  }
  return []
}

function isInlineValid (inline) {
  const SUPPORTED_TYPES = ['images', 'scripts', 'stylesheets']
  if (!Array.isArray(inline)) return ['Compiler option "inline" must be an array']
  if (inline.some(option => !SUPPORTED_TYPES.includes(option))) {
    return [`Compiler option "inline" can contain ["images", "scripts", "stylesheets"]`]
  }
  return []
}

function areCompilersValid (compilers) {
  if (!isPlainObject(compilers)) return ['Compiler option "compilers" must be an object']
  for (let key in compilers) {
    const compiler = compilers[key]
    if (typeof compiler !== 'function') {
      return ['Compiler option "compilers" must contain only functions']
    }
  }
  return []
}

function areLanguagesValid (languages) {
  if (!Array.isArray(languages)) return ['Compiler option "languages" must be an array']
  if (languages.some(language => typeof language !== 'string')) {
    return ['Compiler option "languages.language" must be a string']
  }
  if (languages.some(language => language === '')) {
    return ['Compiler option "languages.language" cannot contain empty strings']
  }
  return []
}

function isCacheValid (cache) {
  if (typeof cache !== 'boolean') return ['Compiler option "cache" must be an boolean']
  return []
}

function areAliasesValid (aliases) {
  if (!Array.isArray(aliases)) return ['Compiler option "aliases" must be an array']
  if (aliases.some(alias => !isPlainObject(alias))) {
    return ['Compiler option "aliases.alias" must be an object']
  }
  if (aliases.some(alias => !Object.keys(alias).length)) {
    return ['Compiler option "aliases.alias" cannot be an empty object']
  }
  for (let alias of aliases) {
    if (!('from' in alias) || !('to' in alias)) return ['Compiler option "aliases.alias" must have "from" and "to" property']
    if (!(alias.from instanceof RegExp)) return ['Compiler option "aliases.alias.from" must be a regexp']
    if (typeof alias.to !== 'string') return ['Compiler option "aliases.alias.to" must be a string']
  }
  return []
}

function areStylesValid (styles) {
  const { colors } = styles
  if (!isPlainObject(styles)) return ['Compiler option "styles" must be an object']
  if (colors && !isPlainObject(colors)) return ['Compiler option "styles.colors" must be an object']
  return []
}
