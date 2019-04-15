import test from '../../helpers/test'
import compile from '../../helpers/compile'
import escape from 'escape-html'

test('font: ttfs fonts', async assert => {
  var { template } = await compile('<font NunitoRegular from="/fonts/NunitoRegular.ttf" />')
  assert.deepEqual(template({}, escape), '<style>@font-face { font-family: "NunitoRegular"; src: local("NunitoRegular"), url(/fonts/NunitoRegular.ttf) format("truetype"); }</style>')
})
