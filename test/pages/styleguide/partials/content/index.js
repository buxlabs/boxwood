const { div } = require('../../../../..')
const accordion = require('../../../../components/accordion')

module.exports = () => {
  return div([
    accordion({ title: 'Section 1...' }, [])
  ])
}
