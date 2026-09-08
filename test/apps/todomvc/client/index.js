import { start } from "./controllers/app"

document.querySelectorAll("[data-app]").forEach(function (root) {
  start(root)
})
