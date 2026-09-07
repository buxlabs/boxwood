document.querySelectorAll("[data-cart]").forEach(function (cart) {
  if (cart.ready) return
  cart.ready = true

  const count = cart.querySelector("[data-count]")
  const total = cart.querySelector("[data-total]")
  const clear = cart.querySelector("[data-clear]")

  let items = 0
  let amount = 0

  function render() {
    count.textContent = String(items)
    total.textContent = "$" + amount.toFixed(2)
  }

  document.addEventListener("cart:add", function (event) {
    items += 1
    amount += event.detail.price
    render()
  })

  clear.addEventListener("click", function () {
    items = 0
    amount = 0
    render()
    document.dispatchEvent(new CustomEvent("cart:cleared"))
  })
})
