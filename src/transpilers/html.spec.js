'use strict'

const test = require('ava')
const { transpile } = require('./html')

test('transpile: text', assert => {
  assert.deepEqual(transpile('foo'), `import {tag} from "boxwood";
export default function () {
  return "foo";
}
`)
})

test('transpile: html tag', assert => {
  assert.deepEqual(transpile('<div></div>'), `import {tag} from "boxwood";
export default function () {
  return tag("div");
}
`)
})

test('transpile: multiple html tags', assert => {
  assert.deepEqual(transpile('<div></div><div></div>'), `import {tag} from "boxwood";
export default function () {
  return [tag("div"), tag("div")];
}
`)
})

test('transpile: html tag with an attribute', assert => {
  assert.deepEqual(transpile('<div class="foo"></div>'), `import {tag} from "boxwood";
export default function () {
  return tag("div", {
    class: "foo"
  });
}
`)
})

test('transpile: html tag with text', assert => {
  assert.deepEqual(transpile('<div>foo</div>'), `import {tag} from "boxwood";
export default function () {
  return tag("div", ["foo"]);
}
`)
})

test('transpile: empty string', assert => {
  assert.deepEqual(transpile(''), `import {tag} from "boxwood";
export default function () {
  return [];
}
`)
})
