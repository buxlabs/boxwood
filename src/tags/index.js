const foreachTag = require('./foreach')
const forTag = require('./for')
const tryTag = require('./try')
const catchTag = require('./catch')
const unlessTag = require('./unless')
const elseunlessTag = require('./elseunless')
const switchTag = require('./switch')
const caseTag = require('./case')
const defaultTag = require('./default')
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
const svgTag = require('./svg')
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
  default: defaultTag,
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
  svg: svgTag,
  translate: translateTag,
  var: varTag
}
