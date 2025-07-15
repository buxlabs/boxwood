const test = require("node:test")
const assert = require("node:assert")
const express = require("express")
const { join } = require("path")
const http = require("http")
const crypto = require("crypto")

const { compile } = require("../../..")
const engine = require("..")

test("express-boxwood can renders views", async () => {
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

test("express-boxwood works in production mode", async () => {
  const app = express()

  app.engine("js", engine({ compile, env: "production" }))
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

test("express-boxwood supports CSP nonce for inline scripts", async () => {
  const app = express()

  app.engine("js", engine({ compile }))
  app.set("views", join(__dirname, "fixtures/views"))
  app.set("view engine", "js")
  
  // Middleware to generate nonce for each request
  // The nonce is stored in res.locals and automatically injected into all templates
  app.use((req, res, next) => {
    // Generate a random nonce
    res.locals.nonce = crypto.randomBytes(16).toString('base64')
    
    // Set CSP header
    res.setHeader(
      'Content-Security-Policy',
      `script-src 'nonce-${res.locals.nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none';`
    )
    next()
  })
  
  app.get("/", (req, res) => {
    // No need to explicitly pass nonce - it's automatically injected from res.locals
    res.render("inline-script-csp")
  })

  let server
  await new Promise((resolve) => {
    server = app.listen(0, resolve)
  })

  const response = await new Promise((resolve) => {
    http.get(`http://localhost:${server.address().port}`, (res) => {
      let data = ""
      const headers = res.headers
      res.on("data", (chunk) => {
        data += chunk
      })
      res.on("end", () => {
        resolve({ html: data, headers })
      })
    })
  })

  // Check that CSP header is set
  assert(response.headers['content-security-policy'])
  assert(response.headers['content-security-policy'].includes('script-src'))
  assert(response.headers['content-security-policy'].includes('nonce-'))
  
  // Extract nonce from CSP header
  const cspNonce = response.headers['content-security-policy'].match(/nonce-([^']+)/)[1]
  
  // Check that the HTML includes script tag with the same nonce
  assert(response.html.includes(`<script nonce="${cspNonce}">`))
  assert(response.html.includes('console.log("Hello from inline script")'))
  assert(response.html.includes('Page with inline script'))

  await new Promise((resolve) => {
    server.close(resolve)
  })
})

test("express-boxwood automatically injects nonce with custom data", async () => {
  const app = express()

  app.engine("js", engine({ compile }))
  app.set("views", join(__dirname, "fixtures/views"))
  app.set("view engine", "js")
  
  // Middleware to set nonce
  app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString("base64")
    res.setHeader(
      "Content-Security-Policy",
      `script-src 'nonce-${res.locals.nonce}' 'strict-dynamic';`
    )
    next()
  })
  
  app.get("/", (req, res) => {
    // Pass custom data but NOT nonce - nonce is auto-injected
    res.render("inline-script-csp-with-custom-data", { title: "Custom Title" })
  })

  let server
  await new Promise((resolve) => {
    server = app.listen(0, resolve)
  })

  const response = await new Promise((resolve) => {
    http.get(`http://localhost:${server.address().port}`, (res) => {
      let data = ""
      const headers = res.headers
      res.on("data", (chunk) => {
        data += chunk
      })
      res.on("end", () => {
        resolve({ html: data, headers })
      })
    })
  })

  // Extract nonce from CSP header
  const cspNonce = response.headers["content-security-policy"].match(/nonce-([^']+)/)[1]
  
  // Verify nonce is in script tag
  assert(response.html.includes(`<script nonce="${cspNonce}">`))
  // Verify custom data was passed through
  assert(response.html.includes("<h1>Custom Title</h1>"))
  assert(response.html.includes('console.log("Page loaded")'))

  await new Promise((resolve) => {
    server.close(resolve)
  })
})
