const { Body, Head, Html, Script, Title } = require("../../..")

// The kind of value a page would hand its client script: text somebody else
// wrote, carrying the one sequence that can close the tag early.
const todos = [
  { description: "</script><img src=x onerror=alert(1)>" },
  { description: "a < b && c > d" },
]

module.exports = () => {
  return Html([
    Head([Title("Data")]),
    Body([
      Script({ type: "application/json", id: "todos" }, JSON.stringify(todos)),
    ]),
  ])
}
