const test = require('ava')
const { parseJS, parseJSON, parseYAML } = require('./data')

test('parseJS: it serializes data', assert => {
  const data = parseJS(`
    export default {
      i18n: {
        read_more: {
          pl: "Czytaj więcej",
          en: "Read more"
        }
      }
    }
  `)
  assert.deepEqual(data, {
    i18n: {
      read_more: {
        pl: 'Czytaj więcej',
        en: 'Read more'
      }
    }
  })
})

test('parseJSON: it serializes data', assert => {
  const data = parseJSON(`
    {
      "i18n": {
        "read_more": {
          "pl": "Czytaj więcej",
          "en": "Read more"
        }
      }
    }
  `)
  assert.deepEqual(data, {
    i18n: {
      read_more: {
        pl: 'Czytaj więcej',
        en: 'Read more'
      }
    }
  })
})


test('parseYAML: it serializes data', assert => {
  const data = parseYAML(`
    i18n:
      read_more:
        pl: Czytaj więcej
        en: Read more
  `)
  assert.deepEqual(data, {
    i18n: {
      read_more: {
        pl: 'Czytaj więcej',
        en: 'Read more'
      }
    }
  })
})
