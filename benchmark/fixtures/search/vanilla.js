module.exports = function ({ count, results }) {
  let template = '<div class="search">' +
    '<div class="loader">Loading...</div>' +
    '<div class="results">' +
      '<p>' + count + ' results</p>'

  for (let i = 0, ilen = results.length; i < ilen; i++) {
    const result = results[i]
    template += '<div class="title">' + result.title + '</div>'
    template += '<div class="description">' + result.description + '</div>'
    if (result.featured) {
      template += '<div class="highlight">Featured!</div>'
    }
    if (result.sizes.length) {
      template += '<ul>'
      for (let j = 0, jlen = result.sizes.length; j < jlen; j += 1) {
        const size = result.sizes[j]
        template += '<li>' + size + '</li>'
      }
      template += '</ul>'
    }
  }

  template += '</div></div>'
  return template
}
