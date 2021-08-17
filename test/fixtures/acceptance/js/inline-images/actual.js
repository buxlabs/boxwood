import { img } from "boxwood"
import png from "images/1x1.png"
import svg from "images/line.svg"
import jpg from "images/1x1.jpg"
import jpeg from "images/1x1.jpeg"

export default function app () {
  return [
    img({ src: png }),
    img({ src: svg }),
    img({ src: jpg }),
    img({ src: jpeg })
  ]
}
