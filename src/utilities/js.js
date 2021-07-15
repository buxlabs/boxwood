const { unique } = require('pure-utilities/array')

function concatenateScripts (scripts) {
  scripts = unique(scripts)
  let output = ''
  for (let i = 0, ilen = scripts.length; i < ilen; i++) {
    if (scripts[i - 1] && !scripts[i - 1].trim().endsWith(';')) {
      output += ';'
    }
    output += scripts[i]
  }
  return output
}

module.exports = { concatenateScripts }
