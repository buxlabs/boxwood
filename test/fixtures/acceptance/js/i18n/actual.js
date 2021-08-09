import { div } from "boxwood"
import { i18n } from "./data.yaml"

export default function app ({ language }) {
  const translate = i18n(language)
  return div(translate('hello'))
}
