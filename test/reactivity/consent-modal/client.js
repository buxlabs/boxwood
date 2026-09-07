document.querySelectorAll("[data-modal]").forEach(function (modal) {
  if (modal.ready) return
  modal.ready = true

  const options = modal.querySelector("[data-options]")
  const analytics = modal.querySelector("[data-analytics]")
  const marketing = modal.querySelector("[data-marketing]")
  const manage = modal.querySelector("[data-manage]")
  const save = modal.querySelector("[data-save]")
  const reject = modal.querySelector("[data-reject]")
  const accept = modal.querySelector("[data-accept]")
  const reopen = document.querySelector("[data-reopen]")

  function decide(categories) {
    window.localStorage.setItem("consent", categories.join(","))
    modal.setAttribute("data-hidden", "")
  }

  function selected() {
    const categories = []
    if (analytics.checked) categories.push("analytics")
    if (marketing.checked) categories.push("marketing")
    return categories
  }

  manage.addEventListener("click", function () {
    options.removeAttribute("data-hidden")
    save.removeAttribute("data-hidden")
    manage.setAttribute("data-hidden", "")
  })

  accept.addEventListener("click", function () {
    analytics.checked = true
    marketing.checked = true
    decide(["analytics", "marketing"])
  })

  reject.addEventListener("click", function () {
    analytics.checked = false
    marketing.checked = false
    decide([])
  })

  save.addEventListener("click", function () {
    decide(selected())
  })

  reopen.addEventListener("click", function () {
    modal.removeAttribute("data-hidden")
  })

  const stored = window.localStorage.getItem("consent")
  if (stored !== null) {
    analytics.checked = stored.includes("analytics")
    marketing.checked = stored.includes("marketing")
    modal.setAttribute("data-hidden", "")
  }
})
