const { component } = require("../../../..")
const { Prose } = require("../../../../ui")

// Default prose content with UI components
const DEFAULT_PROSE = `
<Center>Centered content</Center>

<Container>Container content</Container>

<Grid>Grid content</Grid>

<Group>Group content</Group>

<Stack>Stack content</Stack>

<Center>{title}</Center>

<img src="{images[0].src}" />

<Center id="{user.id}">User Center</Center>

<Container id="{container.id}">Configured Container</Container>
`

module.exports = component((data) => {
  return Prose({ data }, DEFAULT_PROSE)
})
