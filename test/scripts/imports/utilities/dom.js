import { capitalize } from "./string.js"

export function label(element, text) {
  element.textContent = capitalize(text)
}
