const layout = require('./layouts/default')
const sidebar = require('./partials/sidebar')
const content = require('./partials/content')

module.exports = () => {
  return layout({ title: 'Styleguide' }, [
    sidebar(),
    content()
  ])
}
