function validateOptions ({ inline, compilers, paths, languages, cache, variables, aliases }) {
  return [
    ...arePathsValid(paths),
    ...isInlineValid(inline),
    ...areCompilersValid(compilers),
    ...areLanguagesValid(languages),
    ...isCacheValid(cache),
    ...areAliasesValid(aliases)
  ]
}

function arePathsValid (paths) {
  if (!Array.isArray(paths)) return ['Compiler option "paths" must be an array']
  if (paths.some(path => typeof path !== 'string')) {
    return ['Compiler option "paths" must contain only strings']
  }
  if (paths.some(path => path === '')) {
    return ['Compiler option "paths" cannot contains empty strings']
  }
  return []
}

function isInlineValid (inline) {
  const SUPPORTED_TYPES = ['images', 'scripts', 'stylesheets']
  if (!Array.isArray(inline)) return ['Compiler option inline must be an array']
  if (inline.some(option => !SUPPORTED_TYPES.includes(option))) {
    return [`Inline option must be one of ["images", "scripts", "stylesheets"]`]
  }
  return []
}

function areCompilersValid (compilers) {
  if (Object.prototype.toString.call(compilers) !== '[object Object]') return ['Compiler option "compilers" must be an object']
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
    return ['Compiler option "languages" must contain only strings']
  }
  if (languages.some(language => language === '')) {
    return ['Compiler option "languages" cannot contains empty strings']
  }
  return []
}

function isCacheValid (cache) {
  if (typeof cache !== 'boolean') return ['Compiler option "cache" must be an boolean']
  return []
}

function areAliasesValid (aliases) {
  if (!Array.isArray(aliases)) return ['Compiler option "aliases" must be an array']
  if (aliases.some(alias => Object.prototype.toString.call(alias) !== '[object Object]')) {
    return ['Compiler option "aliases" must be an array containing objects']
  }
  if (aliases.some(alias => !Object.keys(alias).length)) {
    return ['An alias cannot be an empty object']
  }
  for (let alias of aliases) {
    if (!('from' in alias) || !('to' in alias)) return ['An alias must have "from" and "to" property']
    if (!(alias.from instanceof RegExp)) return ['An alias "from" option must be an regexp']
    if (typeof alias.to !== 'string') return ['An alias "to" option must be an string']
  }
  return []
}

module.exports = { validateOptions }
