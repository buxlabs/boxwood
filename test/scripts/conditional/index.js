const { component, js, Html, Head, Body, Div } = require("../../..")

const Alpha = component(() => Div({}, "alpha"), {
  scripts: [js`window.alpha = 1`],
})

const Beta = component(() => Div({}, "beta"), {
  scripts: [js`window.beta = 2`],
})

const Gamma = component(() => Div({}, "gamma"), {
  scripts: [js`window.gamma = 3`],
})

// Which scripts end up in the bundle depends on the props, so the merged
// result cannot be keyed on the template alone
module.exports = component(({ parts }) =>
  Html([
    Head([]),
    Body(parts.map((part) => ({ alpha: Alpha, beta: Beta, gamma: Gamma })[part]())),
  ])
)
