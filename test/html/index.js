const { raw } = require("../..")

const html = `
<ul>
  <li>foo</li>
  <li>bar</li>
  <li>baz</li>
</ul>
`

module.exports = () => {
  return raw(html)
}
