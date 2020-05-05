'use strict'

class BaseError extends Error {
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
    super(message)
    this.type = 'CompilerError'
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

class SVGError extends BaseError {
  constructor (message) {
    super(message)
    this.type = 'SVGError'
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

class TranslationError extends BaseError {
  constructor (message) {
    super(message)
    this.type = 'TranslationError'
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

class ExpressionError extends BaseError {
  constructor (type) {
    const message = `Expression type: ${type} isn't supported yet.`
    super(message)
    this.type = 'ExpressionError'
    this.name = this.constructor.name
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

module.exports = {
  CompilerError,
  SVGError,
  TranslationError,
  ExpressionError,
  normalizeError
}
