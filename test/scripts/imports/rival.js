import { capitalize } from "./rival-utilities/string.js"

document.querySelectorAll("[data-rival]").forEach(function (element) {
  element.textContent = capitalize("rival")
})
