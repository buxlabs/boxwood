const test = require("node:test")
const assert = require("node:assert")
const { compile } = require("../../..")

test("component: throws ComponentError when style object missing .css property", async () => {
  const { Html, Head, Body, Div, component } = require("../../..")
  
  const invalidStyles = { container: 'some-class' } // Missing .css property
  
  const MyComponent = component(
    ({ text }) => Html([Head([]), Body([Div({ class: invalidStyles.container }, text)])]),
    { styles: invalidStyles }
  )
  
  assert.throws(
    () => MyComponent({ text: 'Hello' }),
    {
      name: 'ComponentError',
      message: /Invalid style object at index 0: missing \.css property/
    }
  )
})

test("component: throws ComponentError when styles array has invalid item", async () => {
  const { Html, Head, Body, Div, component, css } = require("../../..")
  
  const validStyle = css`div { color: red; }`
  const invalidStyle = { container: 'some-class' } // Missing .css property
  
  const MyComponent = component(
    ({ text }) => Html([Head([]), Body([Div({}, text)])]),
    { styles: [validStyle, invalidStyle] }
  )
  
  assert.throws(
    () => MyComponent({ text: 'Hello' }),
    {
      name: 'ComponentError',
      message: /Invalid style object at index 1: missing \.css property/
    }
  )
})

test("component: throws ComponentError when script object missing .js property", async () => {
  const { Html, Head, Body, Div, component } = require("../../..")
  
  const invalidScript = { someProperty: 'value' } // Missing .js property
  
  const MyComponent = component(
    ({ text }) => Html([Head([]), Body([Div({}, text)])]),
    { scripts: invalidScript }
  )
  
  assert.throws(
    () => MyComponent({ text: 'Hello' }),
    {
      name: 'ComponentError',
      message: /Invalid script object at index 0: missing \.js property/
    }
  )
})

test("component: error message includes helpful information", async () => {
  const { Html, Head, Body, Div, component } = require("../../..")
  
  const invalidStyles = { container: 'some-class' }
  
  const MyComponent = component(
    ({ text }) => Html([Head([]), Body([Div({}, text)])]),
    { styles: invalidStyles }
  )
  
  assert.throws(
    () => MyComponent({ text: 'Hello' }),
    (err) => {
      assert(err.message.includes('css`...`'), 'Error should mention css template tag')
      assert(err.message.includes('css.load()'), 'Error should mention css.load() function')
      return true
    }
  )
})
