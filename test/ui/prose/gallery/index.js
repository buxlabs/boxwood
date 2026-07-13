const { component, Div, Img } = require("../../../..")
const { Prose } = require("../../../../ui")

const Gallery = ({ images = [] }) =>
  Div(
    { class: "gallery" },
    images.map((image) => Img({ src: image })),
  )

// Default prose content with a gallery component
const DEFAULT_PROSE = `
<Gallery images="{images}" />

<Gallery images="{images.slice(0, 2)}" />

<Gallery images="{images.slice(2)}" />
`

module.exports = component((data) => {
  return Prose({ data, components: { Gallery } }, DEFAULT_PROSE)
})
