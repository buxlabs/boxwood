const test = require("node:test")
const assert = require("node:assert")
const { replaceVariables } = require("./replaceVariables")

test("replaceVariables: returns text unchanged when no variables", () => {
  const result = replaceVariables("Hello world", { name: "John" })
  assert.strictEqual(result, "Hello world")
})

test("replaceVariables: replaces single variable", () => {
  const result = replaceVariables("Hello {name}", { name: "John" })
  assert.strictEqual(result, "Hello John")
})

test("replaceVariables: replaces multiple variables", () => {
  const result = replaceVariables("Hello {name}, you have {count} messages", {
    name: "John",
    count: 5,
  })
  assert.strictEqual(result, "Hello John, you have 5 messages")
})

test("replaceVariables: replaces same variable multiple times", () => {
  const result = replaceVariables("{name} and {name}", { name: "John" })
  assert.strictEqual(result, "John and John")
})

test("replaceVariables: handles missing variable by keeping placeholder", () => {
  const result = replaceVariables("Hello {name}", {})
  assert.strictEqual(result, "Hello {name}")
})

test("replaceVariables: handles undefined data", () => {
  const result = replaceVariables("Hello {name}", null)
  assert.strictEqual(result, "Hello {name}")
})

test("replaceVariables: handles empty string", () => {
  const result = replaceVariables("", { name: "John" })
  assert.strictEqual(result, "")
})

test("replaceVariables: handles null text", () => {
  const result = replaceVariables(null, { name: "John" })
  assert.strictEqual(result, null)
})

test("replaceVariables: handles undefined text", () => {
  const result = replaceVariables(undefined, { name: "John" })
  assert.strictEqual(result, undefined)
})

test("replaceVariables: converts numbers to strings", () => {
  const result = replaceVariables("Count: {count}", { count: 42 })
  assert.strictEqual(result, "Count: 42")
})

test("replaceVariables: converts booleans to strings", () => {
  const result = replaceVariables("Active: {active}", { active: true })
  assert.strictEqual(result, "Active: true")
})

test("replaceVariables: handles escaped opening brace", () => {
  const result = replaceVariables("\\{not a variable}", { name: "John" })
  assert.strictEqual(result, "{not a variable}")
})

test("replaceVariables: handles escaped brace with variable", () => {
  const result = replaceVariables("\\{literal} and {name}", { name: "John" })
  assert.strictEqual(result, "{literal} and John")
})

test("replaceVariables: handles multiple escaped braces", () => {
  const result = replaceVariables("\\{one} \\{two} {name}", { name: "John" })
  assert.strictEqual(result, "{one} {two} John")
})

test("replaceVariables: handles unclosed brace", () => {
  const result = replaceVariables("Hello {name", { name: "John" })
  assert.strictEqual(result, "Hello {name")
})

test("replaceVariables: handles empty variable name", () => {
  const result = replaceVariables("Hello {}", { name: "John" })
  assert.strictEqual(result, "Hello {}")
})

test("replaceVariables: handles whitespace in variable name", () => {
  const result = replaceVariables("Hello { name }", { name: "John" })
  assert.strictEqual(result, "Hello John")
})

test("replaceVariables: handles variable at start", () => {
  const result = replaceVariables("{name} says hello", { name: "John" })
  assert.strictEqual(result, "John says hello")
})

test("replaceVariables: handles variable at end", () => {
  const result = replaceVariables("Hello {name}", { name: "John" })
  assert.strictEqual(result, "Hello John")
})

test("replaceVariables: handles only variable", () => {
  const result = replaceVariables("{name}", { name: "John" })
  assert.strictEqual(result, "John")
})

test("replaceVariables: handles adjacent variables", () => {
  const result = replaceVariables("{first}{last}", {
    first: "John",
    last: "Doe",
  })
  assert.strictEqual(result, "JohnDoe")
})

test("replaceVariables: handles null value as keeping placeholder", () => {
  const result = replaceVariables("Hello {name}", { name: null })
  assert.strictEqual(result, "Hello {name}")
})

test("replaceVariables: handles undefined value as keeping placeholder", () => {
  const result = replaceVariables("Hello {name}", { name: undefined })
  assert.strictEqual(result, "Hello {name}")
})

test("replaceVariables: handles zero value", () => {
  const result = replaceVariables("Count: {count}", { count: 0 })
  assert.strictEqual(result, "Count: 0")
})

test("replaceVariables: handles empty string value", () => {
  const result = replaceVariables("Hello {name}", { name: "" })
  assert.strictEqual(result, "Hello ")
})

test("replaceVariables: handles nested braces in value", () => {
  const result = replaceVariables("Code: {code}", { code: "{test}" })
  assert.strictEqual(result, "Code: {test}")
})

test("replaceVariables: handles complex text with multiple patterns", () => {
  const result = replaceVariables(
    "User {user} has {count} items. Visit {url} for {user}'s profile.",
    { user: "Alice", count: 10, url: "example.com" },
  )
  assert.strictEqual(
    result,
    "User Alice has 10 items. Visit example.com for Alice's profile.",
  )
})

test("replaceVariables: handles array indexing", () => {
  const result = replaceVariables("First image: {images[0]}", {
    images: ["image1.jpg", "image2.jpg"],
  })
  assert.strictEqual(result, "First image: image1.jpg")
})

test("replaceVariables: handles array indexing with property access", () => {
  const result = replaceVariables("First image source: {images[0].src}", {
    images: [
      { src: "image1.jpg", alt: "First" },
      { src: "image2.jpg", alt: "Second" },
    ],
  })
  assert.strictEqual(result, "First image source: image1.jpg")
})

test("replaceVariables: handles multiple array indexes", () => {
  const result = replaceVariables("{videos[0]} and {videos[1]}", {
    videos: ["video1.mp4", "video2.mp4", "video3.mp4"],
  })
  assert.strictEqual(result, "video1.mp4 and video2.mp4")
})

test("replaceVariables: handles array indexing with nested property access", () => {
  const result = replaceVariables("Video: {videos[0].src}", {
    videos: [
      { src: "video1.mp4", duration: 120 },
      { src: "video2.mp4", duration: 180 },
    ],
  })
  assert.strictEqual(result, "Video: video1.mp4")
})

test("replaceVariables: handles dot notation for object properties", () => {
  const result = replaceVariables("User name: {user.name}", {
    user: { name: "Alice", age: 30 },
  })
  assert.strictEqual(result, "User name: Alice")
})

test("replaceVariables: handles nested dot notation", () => {
  const result = replaceVariables("City: {user.address.city}", {
    user: { name: "Alice", address: { city: "New York", zip: "10001" } },
  })
  assert.strictEqual(result, "City: New York")
})

test("replaceVariables: handles mixed array and object access", () => {
  const result = replaceVariables(
    "First comment: {posts[0].comments[0].text}",
    {
      posts: [
        {
          title: "Post 1",
          comments: [
            { text: "Great!", author: "Bob" },
            { text: "Nice", author: "Charlie" },
          ],
        },
      ],
    },
  )
  assert.strictEqual(result, "First comment: Great!")
})

test("replaceVariables: handles array index out of bounds", () => {
  const result = replaceVariables("Image: {images[5]}", {
    images: ["image1.jpg", "image2.jpg"],
  })
  assert.strictEqual(result, "Image: {images[5]}")
})

test("replaceVariables: handles missing property in path", () => {
  const result = replaceVariables("Source: {images[0].src}", {
    images: [{ alt: "First" }],
  })
  assert.strictEqual(result, "Source: {images[0].src}")
})

test("replaceVariables: handles undefined intermediate value", () => {
  const result = replaceVariables("City: {user.address.city}", {
    user: { name: "Alice" },
  })
  assert.strictEqual(result, "City: {user.address.city}")
})

test("replaceVariables: handles array access on non-array", () => {
  const result = replaceVariables("Value: {name[0]}", {
    name: "Alice",
  })
  assert.strictEqual(result, "Value: A")
})

test("replaceVariables: handles property access on null", () => {
  const result = replaceVariables("City: {user.address}", {
    user: null,
  })
  assert.strictEqual(result, "City: {user.address}")
})

test("replaceVariables: combines simple and complex paths", () => {
  const result = replaceVariables(
    "Hello {name}, your first image is {images[0].src}",
    {
      name: "Alice",
      images: [{ src: "photo1.jpg" }, { src: "photo2.jpg" }],
    },
  )
  assert.strictEqual(result, "Hello Alice, your first image is photo1.jpg")
})
