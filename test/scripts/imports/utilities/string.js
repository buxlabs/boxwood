export function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// Nothing imports this, so it should not reach the browser.
export function unused(value) {
  return value.toLowerCase()
}
