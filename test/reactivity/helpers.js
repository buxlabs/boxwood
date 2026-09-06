/*
 * Shared by every fixture in this directory. The behaviour under test is hand
 * written today and will be written against a reactive interface later -
 * whatever the interface turns out to be, these invariants hold for both.
 */

/*
 * Run the page's bundle a second time on a document it has already wired up.
 * That happens for real on a soft navigation, when a fragment is swapped in,
 * or when the same bundle ends up included twice.
 *
 * Returns the number of listeners the second run registered, which must be
 * zero. Counting them is the point: whether stacked listeners are *visible*
 * depends on how a particular handler is written - a counter that re-reads its
 * value from the DOM converges on the same number either way and hides the
 * problem, while a running total doubles. The registration count does not care.
 */
function runBundleAgain(dom) {
  const { window } = dom
  const scripts = window.document.querySelectorAll("script")
  if (scripts.length !== 1) {
    throw new Error(`expected exactly one inline script, found ${scripts.length}`)
  }

  const { prototype } = window.EventTarget
  const original = prototype.addEventListener
  let registered = 0
  prototype.addEventListener = function (...args) {
    registered += 1
    return original.apply(this, args)
  }

  try {
    window.eval(scripts[0].textContent)
  } finally {
    prototype.addEventListener = original
  }

  return registered
}

module.exports = { runBundleAgain }
