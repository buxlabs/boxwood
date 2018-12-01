import test from '../helpers/test'
import compile from '../helpers/compile'
import { normalize } from '../helpers/string'

test('output: empty string', async assert => {
  const template = await compile('')
  assert.deepEqual(normalize(template.toString()), normalize('function render() { return ""; }'))
})

test('output: string', async assert => {
  const template = await compile('foo')
  assert.deepEqual(normalize(template.toString()), normalize('function render() { return "foo"; }'))
})

test('output: html tag and string', async assert => {
  const template = await compile('<div>foo</div>')
  assert.deepEqual(normalize(template.toString()), normalize('function render() { return "<div>foo</div>"; }'))
})

test('output: html tag and a curly tag', async assert => {
  const template = await compile('<div>{foo}</div>')
  assert.deepEqual(normalize(template.toString()), normalize('function render(__o, __e) { var __t = "<div>"; __t += __e(__o.foo); __t += "</div>"; return __t; }'))
})

test('output: html tags and a curly tag', async assert => {
  const template = await compile('<div>{foo}</div><div>bar</div>')
  assert.deepEqual(normalize(template.toString()), normalize('function render(__o, __e) { var __t = "<div>"; __t += __e(__o.foo); __t += "</div><div>bar</div>"; return __t; }'))
})

