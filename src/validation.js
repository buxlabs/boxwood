function validateOptions (options) { 
  if (!Array.isArray(options.paths)) return ['Compiler option paths must be an array']
  return []
}

module.exports = {
  validateOptions
}