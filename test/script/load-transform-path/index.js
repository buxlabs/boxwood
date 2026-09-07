const { join, basename, dirname } = require("path")
const { component, js, Body, Head, Html, Title } = require("../../..")

/*
 * A transform that resolves imports - a bundler, a compiler - cannot work from
 * the source alone: a relative specifier is relative to the file it appears
 * in. So the transform is handed the resolved path alongside the code.
 */
module.exports = component(() => Html([Head([Title("Transform")]), Body([])]), {
  scripts: [
    js.load(join(__dirname, "client.js"), {
      transform: (code, { path }) =>
        code.replace(
          "original",
          `${basename(dirname(path))}/${basename(path)}`,
        ),
    }),
  ],
})
