// Hooks are data attributes, so nothing here is interpolated. The guard is a
// property rather than an attribute: an attribute would be serialised into the
// markup and survive a soft navigation that rebuilds the DOM, while the
// listeners it stood for would not.
document.querySelectorAll("[data-counter]").forEach(function (counter) {
  if (counter.ready) return
  counter.ready = true

  const value = counter.querySelector("[data-value]")
  const button = counter.querySelector("[data-increment]")
  let count = Number(value.textContent)

  button.addEventListener("click", function () {
    count += 1
    value.textContent = String(count)
  })
})
