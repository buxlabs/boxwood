'use strict'

const Plugin = require('../Plugin')
const { convertElementValueToBase64, prepareStyles } = require('./css')

class InlinePlugin extends Plugin {
  constructor () {
    super()
    this.styles = []
  }

  beforeprerun () {
    this.styles = []
  }

  prerun ({ fragment, attrs, keys, assets, options }) {
    if (fragment.tagName === 'style' && keys.includes('inline')) {
      const { styles, output } = prepareStyles(fragment.children[0].content, assets, options)
      styles.forEach(style => this.styles.push(style))
      fragment.children[0].content = output
    }
  }

  run ({ fragment, keys, assets, options }) {
    if (fragment.tagName === 'font' && keys.includes('inline')) {
      const attribute = fragment.attributes.find(attribute => attribute.key === 'from')
      convertElementValueToBase64({ element: attribute, value: attribute.value, assets, options, isFont: true })
    }
    if (fragment.type === 'element' && fragment.tagName !== 'style' && this.styles.length) {
      const classAttribute = fragment.attributes.find(attribute => attribute.key === 'class')
      if (classAttribute) {
        const styles = classAttribute.value.split(/\s/).filter(Boolean) || []
        fragment.attributes = fragment.attributes
          .map(attribute => {
            if (attribute.key === 'class') {
              this.styles.filter(({ type }) => type === 'ClassSelector').forEach(({ className }) => {
                attribute.value = attribute.value.replace(className, '')
                attribute.value = attribute.value.replace(/\s+/, '')
                return attribute.value ? attribute : null
              })
            }
            return attribute
          })
          .filter(attribute => attribute.value)
        this.styles
          .filter(({ className, type }) => type === 'ClassSelector' && styles.includes(className))
          .forEach(({ declaration }) => {
            const styleAttribute = fragment.attributes.find(attribute => attribute.key === 'style')
            if (styleAttribute) {
              if (!styleAttribute.value.includes(declaration)) {
                fragment.attributes = fragment.attributes.map(attribute => {
                  if (attribute.key === 'style') {
                    attribute.value += ';'.concat(declaration)
                  }
                  return attribute
                })
              }
            } else {
              fragment.attributes.push({ key: 'style', value: declaration })
            }
          })
      }
    }
    if (fragment.tagName === 'style' &&
      keys.includes('inline') &&
      fragment.children &&
      fragment.children.length === 1 &&
      fragment.children[0].content === ''
    ) {
      fragment.type = 'text'
      fragment.content = ''
      fragment.children = []
    }
  }
}

module.exports = InlinePlugin
