const { input } = require("../../..")

module.exports = () => {
  return [
    input({
      type: "text",
      name: "username",
      placeholder: "Enter your username",
      value: "John Doe",
      autofocus: true,
    }),
    input({
      type: "text",
      name: "password",
      placeholder: "Enter your password",
      value: "",
      autofocus: false,
    }),
  ]
}
