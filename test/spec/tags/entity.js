import test from 'ava'
import compile from '../../helpers/compile'

test('entity: nbsp', async assert => {
  var { template } = await compile('<entity nbsp>')
  assert.deepEqual(template({}, escape), ' ')
  
  var { template } = await compile('<entity #160>')
  assert.deepEqual(template({}, escape), ' ')  

  var { template } = await compile('<entity non-breaking space>')
  assert.deepEqual(template({}, escape), ' ') 
})

test('entity: lt', async assert => {
  var { template } = await compile('<entity lt>')
  assert.deepEqual(template({}, escape), '<')

  var { template } = await compile('<entity #60>')
  assert.deepEqual(template({}, escape), '<')
  
  var { template } = await compile('<entity less than>')
  assert.deepEqual(template({}, escape), '<')    
})

test('entity: gt', async assert => {
  var { template } = await compile('<entity gt>')
  assert.deepEqual(template({}, escape), '>')

  var { template } = await compile('<entity #62>')
  assert.deepEqual(template({}, escape), '>')
  
  var { template } = await compile('<entity greater than>')
  assert.deepEqual(template({}, escape), '>')    
})

test('entity: amp', async assert => {
  var { template } = await compile('<entity amp>')
  assert.deepEqual(template({}, escape), '&')

  var { template } = await compile('<entity #38>')
  assert.deepEqual(template({}, escape), '&')
  
  var { template } = await compile('<entity ampersand>')
  assert.deepEqual(template({}, escape), '&')    
})

test('entity: quot', async assert => {
  var { template } = await compile('<entity quot>')
  assert.deepEqual(template({}, escape), '"')

  var { template } = await compile('<entity #34>')
  assert.deepEqual(template({}, escape), '"')
  
  var { template } = await compile('<entity double quotation mark>')
  assert.deepEqual(template({}, escape), '"')    
})

test('entity: apos', async assert => {
  var { template } = await compile('<entity apos>')
  assert.deepEqual(template({}, escape), '\'')

  var { template } = await compile('<entity #39>')
  assert.deepEqual(template({}, escape), '\'')
  
  var { template } = await compile('<entity single quotation mark>')
  assert.deepEqual(template({}, escape), '\'')    
})

test('entity: cent', async assert => {
  var { template } = await compile('<entity cent>')
  assert.deepEqual(template({}, escape), '¢')

  var { template } = await compile('<entity #162>')
  assert.deepEqual(template({}, escape), '¢')
})

test('entity: pound', async assert => {
  var { template } = await compile('<entity pound>')
  assert.deepEqual(template({}, escape), '£')

  var { template } = await compile('<entity #163>')
  assert.deepEqual(template({}, escape), '£')
})

test('entity: yen', async assert => {
  var { template } = await compile('<entity yen>')
  assert.deepEqual(template({}, escape), '¥')

  var { template } = await compile('<entity #165>')
  assert.deepEqual(template({}, escape), '¥')
})

test('entity: euro', async assert => {
  var { template } = await compile('<entity euro>')
  assert.deepEqual(template({}, escape), '€')

  var { template } = await compile('<entity #8364>')
  assert.deepEqual(template({}, escape), '€')
})

test('entity: copy', async assert => {
  var { template } = await compile('<entity copy>')
  assert.deepEqual(template({}, escape), '©')

  var { template } = await compile('<entity #169>')
  assert.deepEqual(template({}, escape), '©')

  var { template } = await compile('<entity copyright>')
  assert.deepEqual(template({}, escape), '©')  
})

test('entity: reg', async assert => {
  var { template } = await compile('<entity reg>')
  assert.deepEqual(template({}, escape), '®')

  var { template } = await compile('<entity #174>')
  assert.deepEqual(template({}, escape), '®')

  var { template } = await compile('<entity registered trademark>')
  assert.deepEqual(template({}, escape), '®')  
})