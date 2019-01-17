const parse = require('./html/parse')

class Parser {
  parse (source) {
    let template, rescue
    if (source.includes('<rescue>') && source.includes('</rescue>')) {
      const start = source.indexOf('<rescue>')
      const end = source.indexOf('</rescue>')
      const content = source.substring(start + '<rescue>'.length, end)
      rescue = parse(content)
      source = source.substring(0, start) + source.substring(end, source.length)
    }
    template = parse(source)
    return { template, rescue }
  }
}

module.exports = Parser
