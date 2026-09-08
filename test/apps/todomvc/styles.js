const { join } = require("path")
const { css } = require("../../..")

/*
 * One stylesheet for the whole app, loaded once so that every component sees
 * the same hashed class names. The page is the only component that hands it
 * to component(), which is what puts the <style> tag in the head.
 */
module.exports = css.load(join(__dirname, "index.css"))
