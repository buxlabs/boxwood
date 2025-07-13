const { Input } = require("../../..")

module.exports = () => {
  return [
    Input({
      type: "text",
      name: "username",
      placeholder: "Enter your username",
      value: "John Doe",
      autofocus: true,
    }),
    Input({
      type: "text",
      name: "password",
      placeholder: "Enter your password",
      value: "",
      autofocus: false,
    }),
  ]
}
