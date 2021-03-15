class Compiler {
  constructor (options) {
    this.options = options
  }

  async compile (input) {
    const template = () => {
      return input
    }
    return { template }
  }
}

module.exports = Compiler
