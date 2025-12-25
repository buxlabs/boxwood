const test = require("node:test")
const assert = require("node:assert")
const express = require("express")
const { join } = require("path")
const http = require("http")
const crypto = require("crypto")

const engine = require("../../../adapters/express")

test("express adapter renders views", async () => {
  const app = express()

  app.engine("js", engine())
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

test("express adapter works in production mode", async () => {
  const app = express()

  app.engine("js", engine({ env: "production" }))
  app.set("views", join(__dirname, "fixtures/views"))
  app.set("view engine", "js")
  app.get("/", (_, response) => {
    response.render("index")
  })

  let server
  await new Promise((resolve) => {
    server = app.listen(0, resolve)
  })

  // First request - should compile and cache
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

  // Second request - should use cached template
  const html2 = await new Promise((resolve) => {
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

  assert(html2.includes("<div>hello, world!</div>"))

  await new Promise((resolve) => {
    server.close(resolve)
  })
})

test("express adapter supports CSP nonce for inline scripts", async () => {
  const app = express()

  app.engine("js", engine())
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

test("express adapter automatically injects nonce with custom data", async () => {
  const app = express()

  app.engine("js", engine())
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

test("express adapter purges require cache in development mode", async () => {
  const engine = require("../../../adapters/express")
  const render = engine({ env: "development" })
  const viewPath = join(__dirname, "fixtures/views/index.js")
  
  // First render
  const html1 = await render(viewPath, {})
  assert(html1.includes("<div>hello, world!</div>"))
  
  // The view should be purged from cache and re-loaded on second render
  const html2 = await render(viewPath, {})
  assert(html2.includes("<div>hello, world!</div>"))
})

test("express adapter returns html without callback", async () => {
  const engine = require("../../../adapters/express")
  const render = engine()
  const viewPath = join(__dirname, "fixtures/views/index.js")
  
  const html = await render(viewPath, {})
  assert(typeof html === "string")
  assert(html.includes("<div>hello, world!</div>"))
})

test("express adapter handles errors without callback", async () => {
  const engine = require("../../../adapters/express")
  const render = engine()
  const viewPath = join(__dirname, "fixtures/views/nonexistent.js")
  
  const result = await render(viewPath, {})
  assert(typeof result === "string")
  // Should return error message when no callback is provided
})

test("express adapter handles errors with callback", async () => {
  const engine = require("../../../adapters/express")
  const render = engine()
  const viewPath = join(__dirname, "fixtures/views/nonexistent.js")
  
  await new Promise((resolve) => {
    render(viewPath, {}, (error, html) => {
      assert(error)
      assert(!html)
      resolve()
    })
  })
})