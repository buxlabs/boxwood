const { getTemplateAssignmentExpression } = require('../factory')
const { getLiteral } = require('../ast')

const ENTITIES = [
  {
    value: ' ',
    identifier: ['nbsp', '#160', 'non-breaking space']
  },
  {
    value: '<',
    identifier: ['lt', '#60', 'less than']
  },
  {
    value: '>',
    identifier: ['gt', '#62', 'greater than']
  },
  {
    value: '&',
    identifier: ['amp', '#38', 'ampersand']
  },
  {
    value: '"',
    identifier: ['quot', '#34', 'double quotation mark']
  },
  {
    value: '\'',
    identifier: ['apos', '#39', 'single quotation mark']
  },
  {
    value: '¢',
    identifier: ['cent', '#162']
  },
  {
    value: '£',
    identifier: ['pound', '#163']
  },
  {
    value: '¥',
    identifier: ['yen', '#165']
  },
  {
    value: '€',
    identifier: ['euro', '#8364']
  },
  {
    value: '©',
    identifier: ['copy', '#169', 'copyright']
  },
  {
    value: '®',
    identifier: ['reg', '#174', 'registered trademark']
  }
]

module.exports = function ({ tree, options, attrs }) {
  let identifier = attrs.reduce((accumulator, attribute) => {
    accumulator += `${attribute.key} `
    return accumulator
  }, '')
  identifier = identifier.trim()
  for (let i = 0; i < ENTITIES.length; i++) {
    const entity = ENTITIES[i]
    if (entity.identifier.includes(identifier)) {
      return tree.append(getTemplateAssignmentExpression(options.variables.template, getLiteral(entity.value)))
    }
  }
}
