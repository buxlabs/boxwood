'use strict'

class BaseError extends Error {
  constructor (type, message) {
    super(message)
    this.type = type
    this.name = type
    Error.captureStackTrace(this, this.constructor)
  }

  get stack () {
    return this._stack
  }

  set stack (stack) {
    this._stack = stack
  }
}

class CompilerError extends BaseError {
  constructor (option, message) {
    message = `Compiler option "${option}" ${message}`
    super('CompilerError', message)
    Error.captureStackTrace(this, this.constructor)
  }
}

class SVGError extends BaseError {
  constructor (message) {
    super('SVGError', message)
    Error.captureStackTrace(this, this.constructor)
  }
}

class TranslationError extends BaseError {
  constructor (message) {
    super('TranslationError', message)
    Error.captureStackTrace(this, this.constructor)
  }
}

class YAMLTranslationError extends BaseError {
  constructor (message) {
    super('YAMLTranslationError', message)
    Error.captureStackTrace(this, this.constructor)
  }
}

class JSONTranslationError extends BaseError {
  constructor (message) {
    super('JSONTranslationError', message)
    Error.captureStackTrace(this, this.constructor)
  }
}

class JavaScriptTranslationError extends BaseError {
  constructor (message) {
    super('JavaScriptTranslationError', message)
    Error.captureStackTrace(this, this.constructor)
  }
}

class ExpressionError extends BaseError {
  constructor (type) {
    const message = `Expression type: ${type} isn't supported yet.`
    super('ExpressionError', message)
    Error.captureStackTrace(this, this.constructor)
  }
}

function normalizeError (error) {
  const stack = error.stack || ''
  const lines = stack.split('\n')
  return {
    type: error.type,
    message: error.message,
    stack: lines.join('\n').trim()
  }
}

function createError (type, message, stack) {
  const error = new BaseError(type, message)
  const lines = error.stack.split('\n')
  stack.reverse().forEach(path => lines.splice(1, 0, `    at ${path}`))
  error.stack = lines.join('\n')
  return error
}

module.exports = {
  CompilerError,
  SVGError,
  TranslationError,
  ExpressionError,
  YAMLTranslationError,
  JSONTranslationError,
  JavaScriptTranslationError,
  normalizeError,
  createError
}
