const walk = require('himalaya-walk')
const { analyze } = require('./component')

const ANCHOR_TAG = 'a'
const IMAGE_TAG = 'img'

function isExternalUrl (url) {
  if (!url) { return false }
  return url.startsWith('http://') || url.startsWith('https://')
}

function verifyTags (tree) {
  const warnings = []
  const { components } = analyze(tree)
  walk(tree, node => {
    if (node.tagName === ANCHOR_TAG && !components.includes(ANCHOR_TAG)) {
      const href = node.attributes.find(attribute => attribute.key === 'href')
      if (href && isExternalUrl(href.value)) {
        const rel = node.attributes.find(attribute => attribute.key === 'rel')
        if (!rel) {
          warnings.push({ message: `${ANCHOR_TAG} tag with external href should have a rel attribute (e.g. rel="noopener")`, type: 'REL_ATTRIBUTE_MISSING' })
        }
      }
    }

    if (node.tagName === IMAGE_TAG && !components.includes(IMAGE_TAG)) {
      const alt = node.attributes.find(attribute => attribute.key === 'alt' || attribute.key.startsWith('alt|'))
      if (!alt) {
        warnings.push({ message: `${IMAGE_TAG} tag should have an alt attribute`, type: 'ALT_ATTRIBUTE_MISSING' })
      }
    }
  })
  return warnings
}

module.exports = { verifyTags }
