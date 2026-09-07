const { Button } = require("../../..")

// A string is a real inline handler and stays supported.
module.exports = () => [Button({ onclick: "window.alert('hi')" }, "Go")]
