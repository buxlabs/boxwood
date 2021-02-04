import { h1 } from "boxwood"
import layout from "layouts/default"
import container from "components/container"

export default function app () {
  return layout([
    container([
      h1("Hello, world!")
    ])
  ])
}
