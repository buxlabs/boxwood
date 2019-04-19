import test from 'ava'
import compile from '../../../helpers/compile'
import escape from 'escape-html'

test.skip('script: scoped', async assert => {
  const { template } = await compile('<script scoped>console.log(foo)</script>')
  assert.deepEqual(template({ foo: 2 }, escape), '<script>const foo = 2;\nconsole.log(foo)</script>')
})

test.skip('script: scoped', async assert => {
  const { template } = await compile(`
    <template foo>
      <input name="{name}">
      <script scoped>console.log(name)</script>
    </template>
    <foo name="bar" />
  `)
  assert.deepEqual(template({ foo: 2 }, escape), '<input name="bar"><script>const name = "bar";\nconsole.log(name)</script>')
})
