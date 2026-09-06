const { component, js, Html, Head, Body } = require("../../..")

/*
 * Neither script declares anything in tree.body - the `var` sits inside a
 * block - but a var is hoisted to the top level all the same, so these two
 * do collide. Each script reads its own value back through a closure, which
 * is where sharing one binding stops being harmless.
 */
module.exports = component(() => Html([Head([]), Body([])]), {
  scripts: [
    js`if (true) { var shared = 1 }
       window.readFirst = function () { return shared }`,
    js`if (true) { var shared = 2 }
       window.readSecond = function () { return shared }`,
  ],
})
