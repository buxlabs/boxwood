'use strict'

module.exports = function ({ tree, attrs }) {
  tree.append({
    type: 'SwitchStatement',
    discriminant: {
      type: 'Literal',
      value: true
    },
    attribute: attrs[0],
    cases: []
  })
}
