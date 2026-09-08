// A specifier with no extension, so the resolver has to find it.
import { label } from "./utilities/dom"

document.querySelectorAll("[data-greeting]").forEach(function (element) {
  label(element, "hello there")
})
