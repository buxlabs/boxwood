const test = require('ava')
const compile = require('../../../helpers/deprecated-compile')
const { escape } = require('../../../..')

test.skip('script[scoped]: importing boxwood', async assert => {
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
        var O = Object.create,
            f = Object.defineProperty,
            B = Object.getPrototypeOf,
            I = Object.prototype.hasOwnProperty,
            P = Object.getOwnPropertyNames,
            W = Object.getOwnPropertyDescriptor,
            z = t => f(t, "__esModule", {
                value: !0
            }),
            s = (t, e) => () => (e || (e = {
                exports: {}
            }, t(e.exports, e)), e.exports),
            D = (t, e, i) => {
                if (z(t), e && typeof e == "object" || typeof e == "function")
                    for (let n of P(e)) !I.call(t, n) && n !== "default" && f(t, n, {
                        get: () => e[n],
                        enumerable: !(i = W(e, n)) || i.enumerable
                    });
                return t
            },
            F = t => t && t.__esModule ? t : D(f(t != null ? O(B(t)) : {}, "default", {
                value: t,
                enumerable: !0
            }), t),
            p = s((x, d) => {
                "use strict";

                function G(t) {
                    return Object.assign(Object.create(null), t)
                }
                d.exports = G
            }),
            m = s((T, h) => {
                "use strict";
                const H = p();

                function J(t, e = {}, i = []) {
                    return H({
                        name: t,
                        attributes: e,
                        children: i
                    })
                }
                h.exports = J
            }),
            a = s((tt, g) => {
                "use strict";

                function K(t, e) {
                    return t.replaceWith(e)
                }
                g.exports = K
            }),
            q = s((et, b) => {
                "use strict";
                const M = a();

                function Q(t, e) {
                    return M(e, t), t
                }
                b.exports = Q
            }),
            l = s((rt, k) => {
                "use strict";

                function y(t) {
                    return typeof t == "string" ? R(t) : S(t)
                }

                function R(t) {
                    return document.createTextNode(t)
                }

                function S(t) {
                    const {
                        name: e,
                        attributes: i,
                        children: n
                    } = t, r = document.createElement(e);
                    for (const c in i) {
                        const u = i[c];
                        c === "onclick" ? r.addEventListener("click", u) : r.setAttribute(c, u)
                    }
                    for (let c = 0, u = n.length; c < u; c++) {
                        const L = n[c];
                        r.appendChild(y(L))
                    }
                    return r
                }
                k.exports = y
            }),
            v = s((nt, E) => {
                "use strict";
                const N = l(),
                    A = a(),
                    j = (t, e) => {
                        const i = [];
                        for (const n in e) {
                            const r = e[n];
                            i.push(c => {
                                n === "onclick" ? c.addEventListener("click", r) : c.setAttribute(n, r)
                            })
                        }
                        for (const n in t) e[n] || i.push(r => (r.removeAttribute(n), r));
                        return n => {
                            for (const r in i) r(n);
                            return n
                        }
                    };

                function U(t, e) {
                    if (e === void 0) return r => {
                        r.remove();
                        return
                    };
                    if (typeof t == "string" || typeof e == "string") return t !== e ? r => {
                        const c = N(e);
                        return A(r, c), c
                    } : r => r;
                    if (t.tag !== e.tag) return r => {
                        const c = N(e);
                        return A(r, c), c
                    };
                    const i = j(t.attributes, e.attributes),
                        n = j(t.children, e.children);
                    return r => (i(r), n(r), r)
                }
                E.exports = U
            }),
            C = s((ct, w) => {
                "use strict";
                const V = m(),
                    X = q(),
                    Y = l(),
                    Z = v();
                w.exports = {
                    tag: V,
                    mount: X,
                    render: Y,
                    diff: Z
                }
            });
        const o = F(C()),
            _ = () => o.tag("div", {}, "foo");
        o.mount(o.render(_()), document.getElementById("app"));
    })();
    </script>
  `))
})
