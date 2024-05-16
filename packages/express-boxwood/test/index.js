const test = require("node:test")
const assert = require("node:assert")
const express = require("express")
const { join } = require("path")
const http = require("http")

const { compile } = require("../../..")
const engine = require("..")

test("express-boxwood can ", async () => {
  const app = express()

  app.engine("js", engine({ compile }))
  app.set("views", join(__dirname, "fixtures/views"))
  app.set("view engine", "js")
  app.get("/", (_, response) => {
    response.render("index")
  })

  let server
  await new Promise((resolve) => {
    server = app.listen(0, resolve)
  })

  const html = await new Promise((resolve) => {
    http.get(`http://localhost:${server.address().port}`, (response) => {
      let data = ""
      response.on("data", (chunk) => {
        data += chunk
      })
      response.on("end", () => {
        resolve(data)
      })
    })
  })

  assert(html.includes("<div>hello, world!</div>"))

  await new Promise((resolve) => {
    server.close(resolve)
  })
})
