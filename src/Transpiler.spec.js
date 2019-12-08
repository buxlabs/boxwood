import test from 'ava'
import Transpiler from './Transpiler'

test.skip('it converts <end> for an <if> tag', assert => {
  const transpiler = new Transpiler()
  const source = transpiler.transpile('<if foo><end>')
  assert.deepEqual(source, '<if foo></if>')
})
