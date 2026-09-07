document.querySelectorAll("[data-search]").forEach(function (search) {
  if (search.ready) return
  search.ready = true

  const input = search.querySelector("#query")
  const loader = search.querySelector("[data-loader]")
  const message = search.querySelector("[data-message]")
  const results = search.querySelector("[data-results]")

  let timer = null
  // Every request takes a number. Only the newest one may write to the page -
  // a slow response for an older query is dropped on arrival.
  let latest = 0

  function toggle(element, on) {
    element.toggleAttribute("data-hidden", !on)
  }

  function render(items) {
    results.innerHTML = ""
    items.forEach(function (item) {
      const result = document.createElement("li")
      result.setAttribute("data-result", "")
      // textContent, so a title is never read as markup
      result.textContent = item.title
      results.appendChild(result)
    })
  }

  function say(text) {
    message.textContent = text
    toggle(message, true)
  }

  function reset() {
    render([])
    toggle(loader, false)
    toggle(message, false)
  }

  function request(query) {
    const id = ++latest
    render([])
    toggle(message, false)
    toggle(loader, true)
    window
      .fetch("/search?q=" + encodeURIComponent(query))
      .then(function (response) {
        return response.json()
      })
      .then(function (data) {
        if (id !== latest) return
        toggle(loader, false)
        render(data.results)
        if (data.results.length === 0) say("No results for " + query)
      })
      .catch(function () {
        if (id !== latest) return
        toggle(loader, false)
        say("Something went wrong")
      })
  }

  input.addEventListener("input", function () {
    clearTimeout(timer)
    const query = input.value.trim()
    if (query === "") {
      // Nothing in flight may land after the field is cleared.
      latest += 1
      reset()
      return
    }
    timer = setTimeout(function () {
      request(query)
    }, 20)
  })
})
