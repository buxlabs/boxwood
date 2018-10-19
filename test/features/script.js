const { equal } = require('assert')
const compile = require('../helpers/compile')

console.time('script')

equal(compile('<script store>console.log(STORE.foo)</script>')({ foo: 2 }, html => html), '<script>const STORE = {"foo":2}\nconsole.log(STORE.foo)</script>')
equal(compile('<script store>const { foo } = STORE</script>')({ foo: 1 }, html => html), '<script>const STORE = {"foo":1}\nconst { foo } = STORE</script>')

console.timeEnd('script')
