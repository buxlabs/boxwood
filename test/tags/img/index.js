const { Img } = require("../../..")

module.exports = () => {
  return Img({
    src: "https://example.com/image.jpg",
    alt: "Example image",
    width: 100,
    height: 100,
  })
}
