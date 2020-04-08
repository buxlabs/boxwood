'use strict'

const foreachTag = require('./foreach')
const forTag = require('./for')
const tryTag = require('./try')
const catchTag = require('./catch')
const unlessTag = require('./unless')
const elseunlessTag = require('./elseunless')
const switchTag = require('./switch')
const caseTag = require('./case')
const dataTag = require('./data')
const defaultTag = require('./default')
const doctypeTag = require('./doctype')
const markdownTag = require('./markdown')
const fontTag = require('./font')
const spacingTag = require('./spacing')
const spaceTag = require('./space')
const entityTag = require('./entity')
const ifTag = require('./if')
const elseifTag = require('./elseif')
const elseTag = require('./else')
const slotTag = require('./slot')
const imgTag = require('./img')
const scriptTag = require('./script')
const styleTag = require('./style')
const svgTag = require('./svg')
const templateTag = require('./template')
const translateTag = require('./translate')
const varTag = require('./var')

module.exports = {
  foreach: foreachTag,
  for: forTag,
  try: tryTag,
  catch: catchTag,
  unless: unlessTag,
  elseunless: elseunlessTag,
  switch: switchTag,
  case: caseTag,
  data: dataTag,
  default: defaultTag,
  doctype: doctypeTag,
  markdown: markdownTag,
  font: fontTag,
  spacing: spacingTag,
  space: spaceTag,
  entity: entityTag,
  if: ifTag,
  elseif: elseifTag,
  else: elseTag,
  slot: slotTag,
  img: imgTag,
  script: scriptTag,
  style: styleTag,
  svg: svgTag,
  template: templateTag,
  translate: translateTag,
  var: varTag
}
