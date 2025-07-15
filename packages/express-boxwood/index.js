const NODE_ENV = process.env.NODE_ENV || "development"

function purge(path) {
  const name = require.resolve(path)
  const dependency = require.cache[name]
  if (dependency && dependency.children) {
    dependency.children.forEach((child) => {
      delete require.cache[child.id]
      purge(child.id)
    })
    delete require.cache[name]
  }
}

function engine({ compile, env = NODE_ENV }) {
  const cache = new Map()
  async function compileFile(path) {
    if (env === "development") {
      purge(path)
      const { template } = await compile(path)
      return template
    }
    if (cache.has(path)) return cache.get(path)
    const { template } = await compile(path)
    cache.set(path, template)
    return template
  }

  async function render(path, options, callback) {
    try {
      const template = await compileFile(path)
      // Automatically inject nonce from res.locals if available
      const templateOptions = options && options._locals && options._locals.nonce
        ? { ...options, nonce: options._locals.nonce }
        : options
      const html = template(templateOptions)
      if (callback) return callback(null, html)
      return html
    } catch (error) {
      if (callback) return callback(error)
      return error.message
    }
  }
  return render
}

module.exports = engine
