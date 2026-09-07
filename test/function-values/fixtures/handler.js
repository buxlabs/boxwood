const { Button } = require("../../..")

module.exports = () => [
  Button(
    {
      onclick() {
        window.alert("hi")
      },
    },
    "Go",
  ),
]
