import { div } from "boxwood"
import data from "./data.yaml"

export default function app ({ language }) {
  return div(data.phone)
}
