const test = require('ava')
const compile = require('../../helpers/compile')

test('for: simple loop', async assert => {
  var { template } = await compile('<for car in cars>{car}</for>')
  assert.deepEqual(template({
    cars: [
      'Audi',
      'BMW',
      'Hyundai'
    ]
  }), 'AudiBMWHyundai')
})

test('for: simple loop with html tags', async assert => {
  var { template } = await compile('<ul><for car in cars><li>{car}</li></for></ul>')
  assert.deepEqual(template({
    cars: [
      'Audi',
      'BMW',
      'Hyundai'
    ]
  }), '<ul><li>Audi</li><li>BMW</li><li>Hyundai</li></ul>')
})

test('for: nested loops', async assert => {
  var { template } = await compile(`<for cars in groups><for car in cars>{car}</for></for>`)
  assert.deepEqual(template({
    groups: [
      ['Audi', 'BMW'],
      ['Hyundai', 'Toyota']
    ]
  }), 'AudiBMWHyundaiToyota')
})
