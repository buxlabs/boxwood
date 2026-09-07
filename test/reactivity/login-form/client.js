document.querySelectorAll("[data-form]").forEach(function (form) {
  if (form.ready) return
  form.ready = true

  // Ids here belong to the labels first; the script reuses them.
  const email = form.querySelector("#email")
  const password = form.querySelector("#password")
  const error = form.querySelector("[data-error]")
  const submit = form.querySelector("[data-submit]")
  const status = document.querySelector("[data-status]")

  function showError(message) {
    error.textContent = message
    error.removeAttribute("data-hidden")
  }

  function clearError() {
    error.textContent = ""
    error.setAttribute("data-hidden", "")
  }

  function sync() {
    submit.disabled = email.value.trim() === "" || password.value.trim() === ""
  }

  form.addEventListener("input", function () {
    clearError()
    sync()
  })

  form.addEventListener("submit", function (event) {
    event.preventDefault()
    if (!email.value.includes("@")) {
      showError("Enter a valid email address")
      return
    }
    clearError()
    status.textContent = "Signed in as " + email.value
  })

  sync()
})
