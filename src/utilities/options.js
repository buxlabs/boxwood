'use strict'

const { CompilerError } = require('./errors')

module.exports = {
  getOptions: (options) => {
    return Object.assign({
      paths: [],
      path: '.',
      languages: [],
      cache: false,
      script: {
        paths: []
      }
    }, options)
  },
  validateOptions: ({ paths, languages, cache }) => {
    return [
      arePathsValid(paths),
      areLanguagesValid(languages),
      isCacheValid(cache)
    ].filter(Boolean)
  }
}

function arePathsValid (paths) {
  if (!Array.isArray(paths)) return new CompilerError('paths', 'must be an array')
  if (paths.some(path => typeof path !== 'string')) {
    return new CompilerError('paths', 'must contain only strings')
  }
  if (paths.some(path => path === '')) {
    return new CompilerError('paths', 'cannot contain empty strings')
  }
}

function areLanguagesValid (languages) {
  if (!Array.isArray(languages)) return new CompilerError('languages', 'must be an array')
  if (languages.some(language => typeof language !== 'string')) {
    return new CompilerError('languages.language', 'must be a string')
  }
  if (languages.some(language => language === '')) {
    return new CompilerError('languages.language', 'cannot contain empty strings')
  }
}

function isCacheValid (cache) {
  if (typeof cache !== 'boolean') return new CompilerError('cache', 'must be an boolean')
}
