const test = require("node:test")
const assert = require("node:assert")
const { replaceVariables, resolveExpression } = require("./replaceVariables")

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

test("replaceVariables: handles slice method on array", () => {
  const result = replaceVariables("Images: {images.slice(0, 2)}", {
    images: ["a.jpg", "b.jpg", "c.jpg"],
  })
  assert.strictEqual(result, "Images: a.jpg,b.jpg")
})

test("replaceVariables: handles string methods", () => {
  const result = replaceVariables("Name: {name.toUpperCase()}", {
    name: "alice",
  })
  assert.strictEqual(result, "Name: ALICE")
})

test("replaceVariables: handles method call with string argument", () => {
  const result = replaceVariables("List: {tags.join(', ')}", {
    tags: ["one", "two", "three"],
  })
  assert.strictEqual(result, "List: one, two, three")
})

test("replaceVariables: handles chained method with property access", () => {
  const result = replaceVariables("First: {images.slice(1, 3)[0]}", {
    images: ["a.jpg", "b.jpg", "c.jpg"],
  })
  assert.strictEqual(result, "First: b.jpg")
})

test("replaceVariables: keeps placeholder for unsafe method", () => {
  const data = { images: ["a.jpg", "b.jpg"] }
  const result = replaceVariables("Images: {images.pop()}", data)
  assert.strictEqual(result, "Images: {images.pop()}")
  assert.deepStrictEqual(data.images, ["a.jpg", "b.jpg"])
})

test("replaceVariables: keeps placeholder for method with non-literal argument", () => {
  const result = replaceVariables("Images: {images.slice(start, end)}", {
    images: ["a.jpg", "b.jpg"],
    start: 0,
    end: 1,
  })
  assert.strictEqual(result, "Images: {images.slice(start, end)}")
})

test("replaceVariables: keeps placeholder for malformed method call", () => {
  const result = replaceVariables("Images: {images.slice(0,}", {
    images: ["a.jpg", "b.jpg"],
  })
  assert.strictEqual(result, "Images: {images.slice(0,}")
})

test("resolveExpression: resolves a simple path", () => {
  const result = resolveExpression({ name: "John" }, "name")
  assert.strictEqual(result, "John")
})

test("resolveExpression: resolves an array literal of paths", () => {
  const data = { images: ["a.jpg", "b.jpg", "c.jpg"] }
  const result = resolveExpression(data, "[images[0], images[2]]")
  assert.deepStrictEqual(result, ["a.jpg", "c.jpg"])
})

test("resolveExpression: resolves an array literal with property access", () => {
  const data = { user: { name: "John" }, city: "Warsaw" }
  const result = resolveExpression(data, "[user.name, city]")
  assert.deepStrictEqual(result, ["John", "Warsaw"])
})

test("resolveExpression: resolves an array literal with literals", () => {
  const result = resolveExpression({}, '[1, "two", true, null]')
  assert.deepStrictEqual(result, [1, "two", true, null])
})

test("resolveExpression: resolves an array literal mixing paths and literals", () => {
  const data = { images: ["a.jpg", "b.jpg"] }
  const result = resolveExpression(data, '[images[1], "static.jpg"]')
  assert.deepStrictEqual(result, ["b.jpg", "static.jpg"])
})

test("resolveExpression: resolves method calls inside an array literal", () => {
  const data = { images: ["a.jpg", "b.jpg", "c.jpg"] }
  const result = resolveExpression(data, "[images.slice(0, 1), images[2]]")
  assert.deepStrictEqual(result, [["a.jpg"], "c.jpg"])
})

test("resolveExpression: resolves nested array literals", () => {
  const data = { a: 1, b: 2 }
  const result = resolveExpression(data, "[a, [b, a]]")
  assert.deepStrictEqual(result, [1, [2, 1]])
})

test("resolveExpression: resolves an empty array literal", () => {
  const result = resolveExpression({}, "[]")
  assert.deepStrictEqual(result, [])
})

test("resolveExpression: ignores a trailing comma", () => {
  const data = { a: 1 }
  const result = resolveExpression(data, "[a,]")
  assert.deepStrictEqual(result, [1])
})

test("resolveExpression: handles quoted strings containing commas and brackets", () => {
  const result = resolveExpression({}, '["a,b", "c]d"]')
  assert.deepStrictEqual(result, ["a,b", "c]d"])
})

test("resolveExpression: keeps numeric index access behavior", () => {
  const data = ["first", "second"]
  const result = resolveExpression(data, "[0]")
  assert.strictEqual(result, "first")
})

test("resolveExpression: resolves missing paths to undefined elements", () => {
  const data = { a: 1 }
  const result = resolveExpression(data, "[a, missing]")
  assert.deepStrictEqual(result, [1, undefined])
})

test("resolveExpression: returns undefined for a path followed by index access", () => {
  const data = { images: ["a.jpg"] }
  const result = resolveExpression(data, "[images[0]].src")
  assert.strictEqual(result, undefined)
})

test("resolveExpression: returns value when defined instead of fallback", () => {
  const result = resolveExpression({ name: "John" }, 'name ?? "Guest"')
  assert.strictEqual(result, "John")
})

test("resolveExpression: returns fallback literal for missing value", () => {
  const result = resolveExpression({}, 'name ?? "Guest"')
  assert.strictEqual(result, "Guest")
})

test("resolveExpression: returns fallback for null value", () => {
  const result = resolveExpression({ name: null }, 'name ?? "Guest"')
  assert.strictEqual(result, "Guest")
})

test("resolveExpression: does not fall back for zero", () => {
  const result = resolveExpression({ count: 0 }, 'count ?? "none"')
  assert.strictEqual(result, 0)
})

test("resolveExpression: does not fall back for empty string", () => {
  const result = resolveExpression({ name: "" }, 'name ?? "Guest"')
  assert.strictEqual(result, "")
})

test("resolveExpression: does not fall back for false", () => {
  const result = resolveExpression({ active: false }, "active ?? true")
  assert.strictEqual(result, false)
})

test("resolveExpression: falls back to another path", () => {
  const result = resolveExpression({ name: "John" }, "nickname ?? name")
  assert.strictEqual(result, "John")
})

test("resolveExpression: resolves chained fallbacks left to right", () => {
  const data = { name: "John" }
  const result = resolveExpression(data, 'nickname ?? name ?? "Guest"')
  assert.strictEqual(result, "John")
})

test("resolveExpression: returns last operand when all are nullish", () => {
  const result = resolveExpression({}, "nickname ?? name")
  assert.strictEqual(result, undefined)
})

test("resolveExpression: supports number and boolean fallback literals", () => {
  assert.strictEqual(resolveExpression({}, "count ?? 0"), 0)
  assert.strictEqual(resolveExpression({}, "active ?? true"), true)
})

test("resolveExpression: supports fallback with paths and method calls", () => {
  const data = { user: { name: "john" } }
  const result = resolveExpression(data, 'nickname ?? user.name.toUpperCase()')
  assert.strictEqual(result, "JOHN")
})

test("resolveExpression: supports array literal as fallback", () => {
  const data = { defaults: undefined }
  const result = resolveExpression(data, 'images ?? ["placeholder.jpg"]')
  assert.deepStrictEqual(result, ["placeholder.jpg"])
})

test("resolveExpression: supports fallbacks inside array literals", () => {
  const data = { a: "a.jpg" }
  const result = resolveExpression(data, '[a ?? "x.jpg", b ?? "y.jpg"]')
  assert.deepStrictEqual(result, ["a.jpg", "y.jpg"])
})

test("resolveExpression: ignores ?? inside quoted strings", () => {
  const result = resolveExpression({}, 'name ?? "a ?? b"')
  assert.strictEqual(result, "a ?? b")
})

test("replaceVariables: uses fallback for missing variable", () => {
  const result = replaceVariables("Hello {name ?? 'Guest'}", {})
  assert.strictEqual(result, "Hello Guest")
})

test("replaceVariables: prefers value over fallback", () => {
  const result = replaceVariables("Hello {name ?? 'Guest'}", { name: "John" })
  assert.strictEqual(result, "Hello John")
})

test("replaceVariables: renders zero instead of fallback", () => {
  const result = replaceVariables("Count: {count ?? 'none'}", { count: 0 })
  assert.strictEqual(result, "Count: 0")
})

test("replaceVariables: keeps placeholder when whole fallback chain is nullish", () => {
  const result = replaceVariables("Hello {nickname ?? name}", {})
  assert.strictEqual(result, "Hello {nickname ?? name}")
})
