class BoxwoodError extends Error {
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

class CompilerError extends BoxwoodError {
  constructor (option, message) {
    message = `Compiler option "${option}" ${message}`
    super('CompilerError', message)
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = {
  CompilerError
}
