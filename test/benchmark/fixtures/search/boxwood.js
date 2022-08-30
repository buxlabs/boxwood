const { fragment, div, ul, li, p } = require('../../../..')

module.exports = function ({ count, results }) {
  return div({ class: 'search' }, [
    div({ class: 'loader' }, 'Loading...'),
    div({ class: 'results' }, [
      p(`${count} results`),
      ...(results.map(result => fragment([
        div({ class: 'title' }, result.title),
        div({ class: 'description' }, result.description),
        result.featured && div({ class: 'highlight' }, 'Featured!'),
        result.sizes.length && ul(result.sizes.map(size => li(size)))
      ])))
    ])
  ])
}
