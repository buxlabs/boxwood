const { img } = require("../../..")

module.exports = () => {
  return img({
    src: "https://example.com/image.jpg",
    alt: "Example image",
    width: 100,
    height: 100,
  })
}
