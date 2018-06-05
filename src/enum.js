module.exports = {
  TEMPLATE_VARIABLE: '__t',
  OBJECT_VARIABLE: '__o',
  ESCAPE_VARIABLE: '__e',
  GLOBAL_VARIABLES: ['JSON', 'Math', 'Number', 'console'],
  BOOLEAN_ATTRIBUTES: [
    'autofocus',
    'checked',
    'readonly',
    'disabled',
    'formnovalidate',
    'multiple',
    'required'
  ],
  SELF_CLOSING_TAGS: [
    'area', 'base', 'br', 'col', 'command',
    'embed', 'hr', 'img', 'input', 'keygen', 'link',
    'meta', 'param', 'source', 'track', 'wbr', '!doctype'
  ],
  SPECIAL_TAGS: [
    'if',
    'else',
    'elseif',
    'each',
    'for',
    'slot',
    'yield',
    'try',
    'catch',
    'unless',
    'elseunless',
    'switch',
    'case',
    'default',
    'foreach',
    'import',
    'require',
    'partial',
    'render'
  ],
  UNESCAPED_NAMES: [
    'value',
    'checked',
    'readonly',
    'disabled',
    'autofocus',
    'formnovalidate',
    'multiple',
    'required',
    'html'
  ],
  OPERATORS: [
    'or',
    'and'
  ]
}
