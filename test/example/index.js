const layout = require("./layout")
const banner = require("./banner")

module.exports = () => {
  return layout({ language: "en" }, [
    banner({
      title: "Hello, world!",
      description: "Lorem ipsum dolor sit amet",
    }),
  ])
}
