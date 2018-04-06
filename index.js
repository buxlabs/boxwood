const { SAXParser } = require('parse5')

function getValue (value, options) {
    if (value.startsWith('${') && value.endsWith('}')) {
        let property = value.substring(2, value.length - 1)
        return options[property]
    } else {
        return value
    }
}

function serialize (attrs, options, escape) {
    let html = attrs.find(attr => attr.name === 'html')
    if (html) {
        return escape(getValue(html.value, options))
    } else {
        let text = attrs.find(attr => attr.name === 'text')
        if (text) {
            return getValue(text.value, options)
        }
    }
    return ''
}

module.exports = {
  render() {},
  compile(source) {
    const parser = new SAXParser()

    return function (options, escape) {
      let start = ''
      let end = ''
      parser.on('startTag', (node, attrs) => {
        if (node === 'slot' && attrs) {
            start += serialize(attrs, options, escape)
        } else if (attrs) {
            start += '<'
            start += node
            let allowed = attrs.filter(attr => attr.name !== 'html' && attr.name !== 'text')
            if (allowed.length) {
                start += ' '
                start += allowed
                    .filter(attr => attr.name !== 'html' && attr.name !== 'text')
                    .map(attr => `${attr.name}="${attr.value}"`)
                    .join(' ')
            }
            start += '>'
            start += serialize(attrs, options, escape)
        }
      })
      parser.on('endTag', node => {
        if (node !== 'slot') {
            end += `</${node}>`
        }
      })
      parser.on('text', text => {
        start += text
      })
      parser.write(`<slot>${source}</slot>`)
      return start + end
    }
  }
}