const test = require('ava')
const compile = require('../../helpers/compile')
const { escape } = require('../../..')

test('entity: nbsp', async assert => {
  var { template } = await compile('<entity nbsp>')
  assert.deepEqual(template({}, escape), '&nbsp;')
  
  var { template } = await compile('<entity #160>')
  assert.deepEqual(template({}, escape), '&#160;')  

  var { template } = await compile('<entity non-breaking space>')
  assert.deepEqual(template({}, escape), ' ') 
})

test('entity: lt', async assert => {
  var { template } = await compile('<entity lt>')
  assert.deepEqual(template({}, escape), '&lt;')

  var { template } = await compile('<entity #60>')
  assert.deepEqual(template({}, escape), '&#60;')
  
  var { template } = await compile('<entity less than>')
  assert.deepEqual(template({}, escape), '<')    
})

test('entity: gt', async assert => {
  var { template } = await compile('<entity gt>')
  assert.deepEqual(template({}, escape), '&gt;')

  var { template } = await compile('<entity #62>')
  assert.deepEqual(template({}, escape), '&#62;')
  
  var { template } = await compile('<entity greater than>')
  assert.deepEqual(template({}, escape), '>')    
})

test('entity: amp', async assert => {
  var { template } = await compile('<entity amp>')
  assert.deepEqual(template({}, escape), '&amp;')

  var { template } = await compile('<entity #38>')
  assert.deepEqual(template({}, escape), '&#38;')
  
  var { template } = await compile('<entity ampersand>')
  assert.deepEqual(template({}, escape), '&')    
})

test('entity: quot', async assert => {
  var { template } = await compile('<entity quot>')
  assert.deepEqual(template({}, escape), '&quot;')

  var { template } = await compile('<entity #34>')
  assert.deepEqual(template({}, escape), '&#34;')
  
  var { template } = await compile('<entity double quotation mark>')
  assert.deepEqual(template({}, escape), '"')    
})

test('entity: apos', async assert => {
  var { template } = await compile('<entity apos>')
  assert.deepEqual(template({}, escape), '&apos;')

  var { template } = await compile('<entity #39>')
  assert.deepEqual(template({}, escape), '&#39;')
  
  var { template } = await compile('<entity single quotation mark>')
  assert.deepEqual(template({}, escape), '\'')    
})

test('entity: cent', async assert => {
  var { template } = await compile('<entity cent>')
  assert.deepEqual(template({}, escape), '&cent;')

  var { template } = await compile('<entity #162>')
  assert.deepEqual(template({}, escape), '&#162;')
})

test('entity: pound', async assert => {
  var { template } = await compile('<entity pound>')
  assert.deepEqual(template({}, escape), '&pound;')

  var { template } = await compile('<entity #163>')
  assert.deepEqual(template({}, escape), '&#163;')
})

test('entity: yen', async assert => {
  var { template } = await compile('<entity yen>')
  assert.deepEqual(template({}, escape), '&yen;')

  var { template } = await compile('<entity #165>')
  assert.deepEqual(template({}, escape), '&#165;')
})

test('entity: euro', async assert => {
  var { template } = await compile('<entity euro>')
  assert.deepEqual(template({}, escape), '&euro;')

  var { template } = await compile('<entity #8364>')
  assert.deepEqual(template({}, escape), '&#8364;')
})

test('entity: copy', async assert => {
  var { template } = await compile('<entity copy>')
  assert.deepEqual(template({}, escape), '&copy;')

  var { template } = await compile('<entity #169>')
  assert.deepEqual(template({}, escape), '&#169;')

  var { template } = await compile('<entity copyright>')
  assert.deepEqual(template({}, escape), '©')  
})

test('entity: reg', async assert => {
  var { template } = await compile('<entity reg>')
  assert.deepEqual(template({}, escape), '&reg;')

  var { template } = await compile('<entity #174>')
  assert.deepEqual(template({}, escape), '&#174;')

  var { template } = await compile('<entity registered trademark>')
  assert.deepEqual(template({}, escape), '®')  
})
