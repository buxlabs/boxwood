import test from 'ava'
import Importer from './Importer'
import { join } from 'path'

const fixtures = join(__dirname, '../test/fixtures/Importer')

test('Importer: template has no assets', async assert => {
  const source = '<div></div>'
  const importer = new Importer(source)
  const { assets } = await importer.import()
  assert.deepEqual(assets, [])
})

test.only('Importer: template has a script tag', async assert => {
  const source = `<script inline src="./foo.js"></script>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const { assets } = await importer.import()
  const asset = assets[0]
  assert.deepEqual(assets.length, 1)
  assert.deepEqual(asset.name, '')
  assert.deepEqual(asset.source, 'const answer = 42')
  assert.deepEqual(asset.path, join(fixtures, 'foo.js'))
  assert.deepEqual(asset.files, ['.'])
  assert.deepEqual(asset.type, 'SCRIPT')
})

test('Importer: template has one asset', async assert => {
  const source = `<import foo from="./foo.html"><foo/>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const { assets } = await importer.import()
  const asset = assets[0]
  assert.deepEqual(assets.length, 1)
  assert.deepEqual(asset.name, 'foo')
  assert.deepEqual(asset.source, '<div>foo</div>')
  assert.deepEqual(asset.path, join(fixtures, 'foo.html'))
  assert.deepEqual(asset.files, ['.'])
  assert.deepEqual(asset.warnings, [])
})

test('Importer: template has multiple assets', async assert => {
  const source = `<import foo from="./foo.html"><import bar from="./bar.html"><foo/><bar/>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const { assets } = await importer.import()
  const asset1 = assets[0]
  const asset2 = assets[1]
  assert.deepEqual(assets.length, 2)
  assert.deepEqual(asset1.name, 'foo')
  assert.deepEqual(asset1.source, '<div>foo</div>')
  assert.deepEqual(asset1.path, join(fixtures, 'foo.html'))
  assert.deepEqual(asset1.files, ['.'])
  assert.deepEqual(asset1.warnings, [])

  assert.deepEqual(asset2.name, 'bar')
  assert.deepEqual(asset2.source, '<div>bar</div>')
  assert.deepEqual(asset2.path, join(fixtures, 'bar.html'))
  assert.deepEqual(asset2.files, ['.'])
  assert.deepEqual(asset2.warnings, [])
})

test('Importer: template has multiple assets with shorthand syntax', async assert => {
  const source = `<import foo,bar from="."><foo/><bar/>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const { assets } = await importer.import()
  const asset1 = assets[0]
  const asset2 = assets[1]
  assert.deepEqual(assets.length, 2)
  assert.deepEqual(asset1.name, 'foo')
  assert.deepEqual(asset1.source, '<div>foo</div>')
  assert.deepEqual(asset1.path, join(fixtures, 'foo.html'))
  assert.deepEqual(asset1.files, ['.'])
  assert.deepEqual(asset1.warnings, [])

  assert.deepEqual(asset2.name, 'bar')
  assert.deepEqual(asset2.source, '<div>bar</div>')
  assert.deepEqual(asset2.path, join(fixtures, 'bar.html'))
  assert.deepEqual(asset2.files, ['.'])
  assert.deepEqual(asset2.warnings, [])
})

test('Importer: template has multiple assets with shorthand syntax and spacing', async assert => {
  const source = `<import {  foo, bar  } from="."><foo/><bar/>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const { assets } = await importer.import()
  const asset1 = assets[0]
  const asset2 = assets[1]
  assert.deepEqual(assets.length, 2)
  assert.deepEqual(asset1.name, 'foo')
  assert.deepEqual(asset1.source, '<div>foo</div>')
  assert.deepEqual(asset1.path, join(fixtures, 'foo.html'))
  assert.deepEqual(asset1.files, ['.'])
  assert.deepEqual(asset1.warnings, [])

  assert.deepEqual(asset2.name, 'bar')
  assert.deepEqual(asset2.source, '<div>bar</div>')
  assert.deepEqual(asset2.path, join(fixtures, 'bar.html'))
  assert.deepEqual(asset2.files, ['.'])
  assert.deepEqual(asset2.warnings, [])
})

test('Importer: template can have one level of imports', async assert => {
  const source = `<import baz from="./baz.html"><baz/>`
  const importer = new Importer(source, {
    paths: [fixtures]
  })
  const { assets } = await importer.import()
  const asset1 = assets[0]
  const asset2 = assets[1]
  assert.deepEqual(assets.length, 2)
  assert.deepEqual(asset1.name, 'baz')
  assert.deepEqual(asset1.source, '<import qux from="./qux.html"><qux/>')
  assert.deepEqual(asset1.path, join(fixtures, 'baz.html'))
  assert.deepEqual(asset1.files, ['.'])
  assert.deepEqual(asset1.warnings, [])

  assert.deepEqual(asset2.name, 'qux')
  assert.deepEqual(asset2.source, '<div>qux</div>')
  assert.deepEqual(asset2.path, join(fixtures, 'qux.html'))
  assert.deepEqual(asset2.files, [join(fixtures, 'baz.html')])
  assert.deepEqual(asset2.warnings, [])
})

test('Importer: template can have two levels of imports', async assert => {
  const source = `<import bam from="./bam.html"><bam/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { assets } = await importer.import()
  const asset1 = assets[0]
  const asset2 = assets[1]
  const asset3 = assets[2]
  assert.deepEqual(assets.length, 3)
  assert.deepEqual(asset1.name, 'bam')
  assert.deepEqual(asset1.source, '<import baz from="./baz.html"><baz/>')
  assert.deepEqual(asset1.path, join(fixtures, 'bam.html'))
  assert.deepEqual(asset1.files, ['.'])
  assert.deepEqual(asset1.warnings, [])

  assert.deepEqual(asset2.name, 'baz')
  assert.deepEqual(asset2.source, '<import qux from="./qux.html"><qux/>')
  assert.deepEqual(asset2.path, join(fixtures, 'baz.html'))
  assert.deepEqual(asset2.files, [join(fixtures, 'bam.html')])
  assert.deepEqual(asset2.warnings, [])

  assert.deepEqual(asset3.name, 'qux')
  assert.deepEqual(asset3.source, '<div>qux</div>')
  assert.deepEqual(asset3.path, join(fixtures, 'qux.html'))
  assert.deepEqual(asset3.files, [join(fixtures, 'baz.html')])
  assert.deepEqual(asset3.warnings, [])
})

test('Importer: template has unknown asset', async assert => {
  const source = `<import unknown from="./unknown.html"><unknown/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { warnings } = await importer.import()
  assert.deepEqual(warnings.length, 1)
  assert.deepEqual(warnings[0].message, 'Component not found: unknown')
  assert.deepEqual(warnings[0].type, 'COMPONENT_NOT_FOUND')
})

test('Importer: templates reuse same assets', async assert => {
  const source = `<import pages1 from="./pages1.html"><pages1/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { assets } = await importer.import()
  assert.deepEqual(assets.length, 4)
  assert.deepEqual(assets[0].path, join(fixtures, 'pages1.html'))
  assert.deepEqual(assets[1].path, join(fixtures, 'page1.html'))
  assert.deepEqual(assets[2].path, join(fixtures, 'page2.html'))
  assert.deepEqual(assets[3].path, join(fixtures, 'button.html'))
  assert.deepEqual(assets[3].files, [join(fixtures, 'page1.html'), join(fixtures, 'page2.html')])
})

test('Importer: template has nested assets with the same name', async assert => {
  const source = `<import pages2 from="./pages2.html"><pages2/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { assets } = await importer.import()
  assert.deepEqual(assets.length, 5)
  assert.deepEqual(assets[0].path, join(fixtures, 'pages2.html'))
  assert.deepEqual(assets[1].path, join(fixtures, 'page3/index.html'))
  assert.deepEqual(assets[2].path, join(fixtures, 'page4/index.html'))
  assert.deepEqual(assets[3].path, join(fixtures, 'page3/button.html'))
  assert.deepEqual(assets[4].path, join(fixtures, 'page4/button.html'))
})

test('Importer: template has duplicate assets', async assert => {
  const source = `<import duplicate1 from="./duplicate1.html"><duplicate1/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { assets, warnings } = await importer.import()
  assert.deepEqual(assets.length, 2)
  assert.deepEqual(assets[0].path, join(fixtures, 'duplicate1.html'))
  assert.deepEqual(assets[1].path, join(fixtures, 'foo.html'))
  assert.deepEqual(warnings.length, 2)
  assert.deepEqual(warnings[0].message, 'Component name duplicate: foo')
  assert.deepEqual(warnings[0].type, 'COMPONENT_NAME_DUPLICATE')
  assert.deepEqual(warnings[1].message, 'Component path duplicate: ./foo.html')
  assert.deepEqual(warnings[1].type, 'COMPONENT_PATH_DUPLICATE')
})

test('Importer: template has duplicate assets with shorthand syntax', async assert => {
  const source = `<import duplicate2 from="./duplicate2.html"><duplicate2/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { assets, warnings } = await importer.import()
  assert.deepEqual(assets.length, 2)
  assert.deepEqual(assets[0].path, join(fixtures, 'duplicate2.html'))
  assert.deepEqual(assets[1].path, join(fixtures, 'foo.html'))
  assert.deepEqual(warnings.length, 1)
  assert.deepEqual(warnings[0].message, 'Component name duplicate: foo')
  assert.deepEqual(warnings[0].type, 'COMPONENT_NAME_DUPLICATE')
})

test('Importer: template has duplicate assets with require tag', async assert => {
  const source = `<require duplicate3 from="./duplicate3.html"><duplicate3/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { assets, warnings } = await importer.import()
  assert.deepEqual(assets.length, 3)
  assert.deepEqual(assets[0].path, join(fixtures, 'duplicate3.html'))
  assert.deepEqual(assets[1].path, join(fixtures, 'page4/index.html'))
  assert.deepEqual(assets[2].path, join(fixtures, 'page4/button.html'))
  assert.deepEqual(warnings.length, 2)
  assert.deepEqual(warnings[0].message, 'Component name duplicate: page4')
  assert.deepEqual(warnings[0].type, 'COMPONENT_NAME_DUPLICATE')
  assert.deepEqual(warnings[1].message, 'Component path duplicate: ./page4/index.html')
  assert.deepEqual(warnings[1].type, 'COMPONENT_PATH_DUPLICATE')
})

test('Importer: template has a flat circular dependency', async assert => {
  const source = `<import circular-flat-1 from="./circular-flat-1.html"><circular-flat-1/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { warnings } = await importer.import()
  assert.deepEqual(warnings.length, 1)
  assert.deepEqual(warnings[0].type, 'MAXIMUM_IMPORT_DEPTH_EXCEEDED')
  assert.deepEqual(warnings[0].message, 'Maximum import depth exceeded')
})

test('Importer: template has a deep circular dependency', async assert => {
  const source = `<import circular-deep-1 from="./circular-deep-1.html"><circular-deep-1/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { warnings } = await importer.import()
  assert.deepEqual(warnings.length, 1)
  assert.deepEqual(warnings[0].type, 'MAXIMUM_IMPORT_DEPTH_EXCEEDED')
  assert.deepEqual(warnings[0].message, 'Maximum import depth exceeded')
})

test('Importer: template imports itself', async assert => {
  const source = `<import itself from="./itself.html"><itself/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { warnings } = await importer.import()
  assert.deepEqual(warnings.length, 1)
  assert.deepEqual(warnings[0].type, 'MAXIMUM_IMPORT_DEPTH_EXCEEDED')
  assert.deepEqual(warnings[0].message, 'Maximum import depth exceeded')
})

test('Importer: template has an unused asset', async assert => {
  const source = `<import foo from="./foo.html">`
  const importer = new Importer(source, { paths: [fixtures] })
  const { warnings } = await importer.import()
  assert.deepEqual(warnings.length, 1)
  assert.deepEqual(warnings[0].type, 'UNUSED_COMPONENT')
  assert.deepEqual(warnings[0].message, 'foo component is unused')
})

test('Importer: template has a partial tag', async assert => {
  const source = `<partial from="./foo.html"/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { assets, warnings } = await importer.import()
  assert.deepEqual(warnings.length, 0)
  assert.deepEqual(assets.length, 1)
  assert.deepEqual(assets[0].type, 'PARTIAL')
})

test('Importer: template has a render tag', async assert => {
  const source = `<render from="./foo.html"/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { assets, warnings } = await importer.import()
  assert.deepEqual(warnings.length, 0)
  assert.deepEqual(assets.length, 1)
  assert.deepEqual(assets[0].type, 'PARTIAL')
})

test('Importer: template has an include tag', async assert => {
  const source = `<include from="./foo.html"/>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { assets, warnings } = await importer.import()
  assert.deepEqual(warnings.length, 0)
  assert.deepEqual(assets.length, 1)
  assert.deepEqual(assets[0].type, 'PARTIAL')
})

test('Importer: template has a partial attribute', async assert => {
  const source = `<div partial="./foo.html"></div>`
  const importer = new Importer(source, { paths: [fixtures] })
  const { assets, warnings } = await importer.import()
  assert.deepEqual(warnings.length, 0)
  assert.deepEqual(assets.length, 1)
  assert.deepEqual(assets[0].type, 'PARTIAL')
})
