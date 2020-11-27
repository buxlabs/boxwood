const test = require('ava')
const compile = require('../../../helpers/compile')
const { normalize } = require('../../../helpers/string')
const { escape } = require('../../../..')

test('script[scoped]: importing boxwood', async assert => {
  var { template } = await compile(`
    <script scoped>
      import { tag, render, mount } from "boxwood"

      const app = () =>
        tag("div", {}, "foo")

      mount(render(app()), document.getElementById("app"))
    </script>
  `)
  assert.deepEqual(normalize(template({}, escape)), normalize(`
    <script>
      (() => {
        var j = Object.create,
            a = Object.defineProperty,
            v = Object.getPrototypeOf,
            O = Object.prototype.hasOwnProperty,
            T = Object.getOwnPropertyNames,
            k = Object.getOwnPropertyDescriptor,
            A = e => a(e, "__esModule", {
                value: !0
            }),
            c = (e, t) => () => (t || (t = {
                exports: {}
            }, e(t.exports, t)), t.exports),
            B = (e, t, r) => {
                if (A(e), t && typeof t == "object" || typeof t == "function")
                    for (let n of T(t)) !O.call(e, n) && n !== "default" && a(e, n, {
                        get: () => t[n],
                        enumerable: !(r = k(t, n)) || r.enumerable
                    });
                return e
            },
            C = e => e && e.__esModule ? e : B(a(e != null ? j(v(e)) : {}, "default", {
                value: e,
                enumerable: !0
            }), e),
            l = c((M, d) => {
                "use strict";

                function I(e) {
                    return Object.assign(Object.create(null), e)
                }
                d.exports = I
            }),
            p = c((P, m) => {
                "use strict";
                const N = l();

                function W(e, t = {}, r = []) {
                    return N({
                        name: e,
                        attributes: t,
                        children: r
                    })
                }
                m.exports = W
            }),
            g = c((Q, f) => {
                "use strict";

                function w(e, t) {
                    return e.replaceWith(t)
                }

                function z(e, t) {
                    return w(t, e), e
                }
                f.exports = z
            }),
            b = c((R, x) => {
                "use strict";

                function h(e) {
                    return typeof e == "string" ? D(e) : F(e)
                }

                function D(e) {
                    return document.createTextNode(e)
                }

                function F(e) {
                    const {
                        name: t,
                        attributes: r,
                        children: n
                    } = e, i = document.createElement(t);
                    for (const o in r) {
                        const s = r[o];
                        i.setAttribute(o, s)
                    }
                    for (let o = 0, s = n.length; o < s; o++) {
                        const y = n[o];
                        i.appendChild(h(y))
                    }
                    return i
                }
                x.exports = h
            }),
            E = c((S, q) => {
                "use strict";
                const G = p(),
                    H = g(),
                    J = b();
                q.exports = {
                    tag: G,
                    mount: H,
                    render: J
                }
            });
        const u = C(E()),
            K = () => u.tag("div", {}, "foo");
        u.mount(u.render(K()), document.getElementById("app"));
    })();
    </script>
  `))
})
