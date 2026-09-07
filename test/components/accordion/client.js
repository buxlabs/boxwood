document.querySelectorAll("[data-accordion]").forEach(function (header) {
  if (header.ready) return
  header.ready = true

  header.addEventListener("click", function () {
    header.nextElementSibling.toggleAttribute("data-hidden")
  })
})
