'use strict'

const test = require('ava')
const { transpile } = require('./html')

test('transpile: text', assert => {
  assert.deepEqual(transpile('foo'), `export default function () {
  return "foo";
}
`)
})

test('transpile: comment', assert => {
  assert.deepEqual(transpile('<!-- foo -->'), `export default function () {
  return "";
}
`)
})

test('transpile: html div tag', assert => {
  assert.deepEqual(transpile('<div></div>'), `import {tag} from "boxwood";
export default function () {
  return tag("div");
}
`)
})

test('transpile: multiple html tags', assert => {
  assert.deepEqual(transpile('<div></div><span></span>'), `import {tag} from "boxwood";
export default function () {
  return [tag("div"), tag("span")];
}
`)
})

test('transpile: self closing html tags', assert => {
  assert.deepEqual(transpile('<br><hr>'), `import {tag} from "boxwood";
export default function () {
  return [tag("br"), tag("hr")];
}
`)
})

test('transpile: nested html tags', assert => {
  assert.deepEqual(transpile('<div><div></div></div>'), `import {tag} from "boxwood";
export default function () {
  return tag("div", [tag("div")]);
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

test('transpile: if statement with `true`', assert => {
  assert.deepEqual(transpile('<if true>foo</if>'), `export default function () {
  return (function () {
    if (true) {
      return "foo";
    }
  })();
}
`)
})

test('transpile: if statement with `false`', assert => {
  assert.deepEqual(transpile('<if false>foo</if>'), `export default function () {
  return (function () {
    if (false) {
      return "foo";
    }
  })();
}
`)
})

test('transpile: if/else statement with `true`', assert => {
  assert.deepEqual(transpile('<if true>foo</if><else>bar</else>'), `export default function () {
  return (function () {
    if (true) {
      return "foo";
    } else {
      return "bar";
    }
  })();
}
`)
})

test('transpile: if statement with a variable', assert => {
  assert.deepEqual(transpile('<if foo>foo</if>'), `export default function ({foo}) {
  return (function () {
    if (foo) {
      return "foo";
    }
  })();
}
`)
})

test('transpile: empty string', assert => {
  assert.deepEqual(transpile(''), `export default function () {
  return [];
}
`)
})

test('transpile: expression', assert => {
  assert.deepEqual(transpile('{foo}'), `import {escape} from "boxwood";
export default function ({foo}) {
  return escape(foo);
}
`)
})

test('transpile: partial', assert => {
  assert.deepEqual(transpile('<partial from="partials/foo.html"/>'), `import __partialsFooHtml__ from "partials/foo.html";
export default function () {
  return __partialsFooHtml__();
}
`)
})

test('transpile: two partials', assert => {
  assert.deepEqual(transpile('<partial from="partials/foo.html"/> <partial from="partials/bar.html"/>'), `import __partialsFooHtml__ from "partials/foo.html";
import __partialsBarHtml__ from "partials/bar.html";
export default function () {
  return [__partialsFooHtml__(), " ", __partialsBarHtml__()];
}
`)
})

test('transpile: import', assert => {
  assert.deepEqual(transpile('<import foo from="components/foo.html"/><foo/>'), `import __componentsFooHtml__ from "components/foo.html";
export default function () {
  return __componentsFooHtml__();
}
`)
})

test('transpile: simple component with a script', assert => {
  assert.deepEqual(transpile(`
    <div class="foo"></div><script>console.log("bar")</script>
`.trim()), `import {tag} from "boxwood";
export default function () {
  return [tag("div", {
    class: "foo"
  }), tag("script", ["console.log(\\"bar\\")"])];
}
`)
})
