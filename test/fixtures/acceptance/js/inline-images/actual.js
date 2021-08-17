import { img } from "boxwood"
import png from "images/1x1.png"
import svg from "images/line.svg"

export default function app () {
  return [
    img({ src: png }),
    img({ src: svg })
  ]
}
