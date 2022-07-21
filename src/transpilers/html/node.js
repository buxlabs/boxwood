'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const tags = require('./tags')

function transpileNode ({ node: htmlNode, parent, index }) {
  const { type, tagName } = htmlNode
  if (type === 'text') {
    return tags.text(htmlNode)
  } else if (type === 'comment') {
    return tags.comment()
  } else if (tagName === 'if') {
    const statement = tags.if(htmlNode, parent, index, transpileNode)
    const { expression } = AbstractSyntaxTree.iife(statement)
    return expression
  } else if (tagName === 'else') {
    return null
  } else if (tagName === 'elseif') {
    return null
  } else if (tagName === 'unless') {
    const statement = tags.unless(htmlNode, parent, index, transpileNode)
    const { expression } = AbstractSyntaxTree.iife(statement)
    return expression
  } else if (tagName === 'elseunless') {
    return null
  } else if (tagName === 'try') {
    const statement = tags.try(htmlNode, parent, index, transpileNode)
    const { expression } = AbstractSyntaxTree.iife(statement)
    return expression
  } else if (tagName === 'catch') {
    return null
  } else if (tagName === 'for') {
    return tags.for(htmlNode, parent, index, transpileNode)
  } else if (tagName === 'import') {
    return tags.import(htmlNode)
  } else if (tagName === '!doctype') {
    return tags.doctype()
  } else if (tagName === 'partial') {
    return tags.partial(htmlNode)
  } else if (tagName === 'slot') {
    return tags.slot(htmlNode)
  } else if (tagName === 'style') {
    return tags.style(htmlNode)
  }
  return tags.any(htmlNode, transpileNode)
}

module.exports = { transpileNode }
