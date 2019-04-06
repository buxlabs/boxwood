import test from 'ava'
import Importer from './Importer'
import { join } from 'path'

// TODO: Add fixtures

const fixtures = join(__dirname, '../test/fixtures/Importer')
test('Importer: template has no components', async assert => {
  const source = '<div></div>'
  const importer = new Importer(source)
  const components = await importer.import()
  assert.deepEqual(components, [])
})

test('Importer: template has one component', async assert => {
  const source = `<import foo from="./foo.html"><foo/>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const components = await importer.import()
  const component = components[0]
  assert.deepEqual(components.length, 1)
  assert.deepEqual(component.name, 'foo')
  assert.deepEqual(component.source, '<div>foo</div>')
  assert.deepEqual(component.path, join(fixtures, 'foo.html'))
  assert.deepEqual(component.files, ['.'])
  assert.deepEqual(component.warnings, [])
})

test('Importer: template has multiple components', async assert => {
  const source = `<import foo from="./foo.html"><import bar from="./bar.html"><foo/><bar/>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const components = await importer.import()
  const component1 = components[0]
  const component2 = components[1]
  assert.deepEqual(components.length, 2)
  assert.deepEqual(component1.name, 'foo')
  assert.deepEqual(component1.source, '<div>foo</div>')
  assert.deepEqual(component1.path, join(fixtures, 'foo.html'))
  assert.deepEqual(component1.files, ['.'])
  assert.deepEqual(component1.warnings, [])

  assert.deepEqual(component2.name, 'bar')
  assert.deepEqual(component2.source, '<div>bar</div>')
  assert.deepEqual(component2.path, join(fixtures, 'bar.html'))
  assert.deepEqual(component2.files, ['.'])
  assert.deepEqual(component2.warnings, [])
})

test('Importer: template has multiple components with shorthand syntax', async assert => {
  const source = `<import foo,bar from="."><foo/><bar/>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const components = await importer.import()
  const component1 = components[0]
  const component2 = components[1]
  assert.deepEqual(components.length, 2)
  assert.deepEqual(component1.name, 'foo')
  assert.deepEqual(component1.source, '<div>foo</div>')
  assert.deepEqual(component1.path, join(fixtures, 'foo.html'))
  assert.deepEqual(component1.files, ['.'])
  assert.deepEqual(component1.warnings, [])

  assert.deepEqual(component2.name, 'bar')
  assert.deepEqual(component2.source, '<div>bar</div>')
  assert.deepEqual(component2.path, join(fixtures, 'bar.html'))
  assert.deepEqual(component2.files, ['.'])
  assert.deepEqual(component2.warnings, [])
})

test('Importer: template has multiple components with shorthand syntax and spacing', async assert => {
  const source = `<import {  foo, bar  } from="."><foo/><bar/>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const components = await importer.import()
  const component1 = components[0]
  const component2 = components[1]
  assert.deepEqual(components.length, 2)
  assert.deepEqual(component1.name, 'foo')
  assert.deepEqual(component1.source, '<div>foo</div>')
  assert.deepEqual(component1.path, join(fixtures, 'foo.html'))
  assert.deepEqual(component1.files, ['.'])
  assert.deepEqual(component1.warnings, [])

  assert.deepEqual(component2.name, 'bar')
  assert.deepEqual(component2.source, '<div>bar</div>')
  assert.deepEqual(component2.path, join(fixtures, 'bar.html'))
  assert.deepEqual(component2.files, ['.'])
  assert.deepEqual(component2.warnings, [])
})

test('Importer: template can have one level of imports', async assert => {
  const source = `<import baz from="./baz.html"><baz/>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const components = await importer.import()
  const component1 = components[0]
  const component2 = components[1]
  assert.deepEqual(components.length, 2)
  assert.deepEqual(component1.name, 'baz')
  assert.deepEqual(component1.source, '<import qux from="./qux.html"><qux/>')
  assert.deepEqual(component1.path, join(fixtures, 'baz.html'))
  assert.deepEqual(component1.files, ['.'])
  assert.deepEqual(component1.warnings, [])

  assert.deepEqual(component2.name, 'qux')
  assert.deepEqual(component2.source, '<div>qux</div>')
  assert.deepEqual(component2.path, join(fixtures, 'qux.html'))
  assert.deepEqual(component2.files, [join(fixtures, 'baz.html')])
  assert.deepEqual(component2.warnings, [])
})

test('Importer: template can have two levels of imports', async assert => {
  const source = `<import bam from="./bam.html"><bam/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const components = await importer.import()
  const component1 = components[0]
  const component2 = components[1]
  const component3 = components[2]
  // assert.deepEqual(components.length, 3)
  assert.deepEqual(component1.name, 'bam')
  assert.deepEqual(component1.source, '<import baz from="./baz.html"><baz/>')
  assert.deepEqual(component1.path, join(fixtures, 'bam.html'))
  assert.deepEqual(component1.files, ['.'])
  assert.deepEqual(component1.warnings, [])

  assert.deepEqual(component2.name, 'baz')
  assert.deepEqual(component2.source, '<import qux from="./qux.html"><qux/>')
  assert.deepEqual(component2.path, join(fixtures, 'baz.html'))
  assert.deepEqual(component2.files, [join(fixtures, 'bam.html')])
  assert.deepEqual(component2.warnings, [])

  assert.deepEqual(component3.name, 'qux')
  assert.deepEqual(component3.source, '<div>qux</div>')
  assert.deepEqual(component3.path, join(fixtures, 'qux.html'))
  assert.deepEqual(component3.files, [join(fixtures, 'baz.html')])
  assert.deepEqual(component3.warnings, [])
})

test.skip('Importer: template has unknown component', async assert => {
  const source = `<import unknown from="./unknown.html"><unknown/>`
  const importer = new Importer(source, { paths: [fixtures] })
  importer.import()
})

test.skip('Importer: template has nested components with the same name', async assert => {
  const source = `<import pages from="./pages.html"><pages/>`
  const importer = new Importer(source, { paths: [fixtures] })
  importer.import()
})

test.skip('Importer: templates reuse same components', async assert => {
  const source = `<import reuse from="./reuse.html"><reuse/>`
  const importer = new Importer(source, { paths: [fixtures] })
  importer.import()
})

test.skip('Importer: template has a circular dependency', async assert => {
  const source = `<import circular from="./circular.html"><circular/>`
  const importer = new Importer(source, { paths: [fixtures] })
  importer.import()
})
