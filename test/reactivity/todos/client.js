document.querySelectorAll("[data-todos]").forEach(function (list) {
  if (list.ready) return
  list.ready = true

  const form = document.querySelector("[data-new-todo-form]")
  const input = document.querySelector("[data-new-todo]")
  const remaining = document.querySelector("[data-remaining]")
  const empty = document.querySelector("[data-empty]")

  function sync() {
    const items = list.querySelectorAll("[data-item]")
    let count = 0
    items.forEach(function (item) {
      if (!item.hasAttribute("data-done")) count += 1
    })
    remaining.textContent = count + " remaining"
    empty.toggleAttribute("data-hidden", items.length > 0)
  }

  function create(description) {
    const item = document.createElement("li")
    item.setAttribute("data-item", "")
    item.innerHTML =
      '<input type="checkbox" data-action="toggle">' +
      "<span></span>" +
      '<button type="button" data-action="remove">Remove</button>'
    // textContent, so a description is never read as markup
    item.querySelector("span").textContent = description
    return item
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault()
    const description = input.value.trim()
    if (description === "") return
    list.appendChild(create(description))
    input.value = ""
    sync()
  })

  list.addEventListener("change", function (event) {
    if (event.target.getAttribute("data-action") !== "toggle") return
    const item = event.target.closest("[data-item]")
    item.toggleAttribute("data-done", event.target.checked)
    sync()
  })

  list.addEventListener("click", function (event) {
    if (event.target.getAttribute("data-action") !== "remove") return
    event.target.closest("[data-item]").remove()
    sync()
  })

  sync()
})
