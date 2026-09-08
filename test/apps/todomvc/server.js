const express = require("express")
const engine = require("../../../adapters/express")

const PORT = Number(process.env.PORT) || 3000

const app = express()

app.engine("js", engine())
app.set("views", __dirname)
app.set("view engine", "js")

/*
 * The list lives in the browser, because the spec asks for localStorage, so
 * there is nothing here to hand the page but an empty one.
 *
 * Rendering it anyway is not wasted work: it is what a crawler and a reader
 * without JavaScript get, and the whole page - stylesheet and script included
 * - arrives in that one response. A server that did know the todos would pass
 * them as `todos`, and the page would come back filled in.
 */
app.get("/", (request, response) => {
  response.render("index", { todos: [] })
})

app.listen(PORT, () => {
  console.log(`todomvc is on http://localhost:${PORT}`)
})
