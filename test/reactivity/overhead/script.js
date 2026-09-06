/*
 * The authored source, kept in a module of its own so the test can compare the
 * emitted bundle against the exact text the component handed to js``.
 */
module.exports = `document.addEventListener('click', function () {
  window.clicked = true
})`
