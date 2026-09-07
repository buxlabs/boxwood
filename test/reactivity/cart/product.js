document.querySelectorAll("[data-product]").forEach(function (product) {
  if (product.ready) return
  product.ready = true

  const button = product.querySelector("[data-add]")
  const added = product.querySelector("[data-added]")

  let times = 0

  function render() {
    added.textContent = times === 0 ? "" : "added " + times + "x"
  }

  button.addEventListener("click", function () {
    times += 1
    render()
    document.dispatchEvent(
      new CustomEvent("cart:add", {
        detail: {
          id: product.getAttribute("data-id"),
          price: Number(button.getAttribute("data-price")),
        },
      }),
    )
  })

  document.addEventListener("cart:cleared", function () {
    times = 0
    render()
  })
})
