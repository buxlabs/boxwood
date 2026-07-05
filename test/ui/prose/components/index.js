const { component } = require("../../../..")
const { Prose } = require("../../../../ui")
const Center = require("../../../../ui/center")
const Container = require("../../../../ui/container")
const Grid = require("../../../../ui/grid")
const Group = require("../../../../ui/group")
const Stack = require("../../../../ui/stack")

// Components configuration
const components = {
  Center,
  Container,
  Grid,
  Group,
  Stack,
}

// Default prose content with UI components
const DEFAULT_PROSE = `
<Center>Centered content</Center>

<Container>Container content</Container>

<Grid>Grid content</Grid>

<Group>Group content</Group>

<Stack>Stack content</Stack>

<Center>{title}</Center>
`

module.exports = component((data) => {
  return Prose({ components, data }, DEFAULT_PROSE)
})
