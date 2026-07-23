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

test("replaceVariables: resolves method with path arguments", () => {
  const result = replaceVariables("Images: {images.slice(start, end)}", {
    images: ["a.jpg", "b.jpg"],
    start: 0,
    end: 1,
  })
  assert.strictEqual(result, "Images: a.jpg")
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

test("resolveExpression: resolves paths as method arguments", () => {
  const data = { images: ["a.jpg", "b.jpg", "c.jpg"], limit: 2 }
  const result = resolveExpression(data, "images.slice(0, limit)")
  assert.deepStrictEqual(result, ["a.jpg", "b.jpg"])
})

test("resolveExpression: resolves nested paths as method arguments", () => {
  const data = { images: ["a.jpg", "b.jpg"], settings: { gallery: { limit: 1 } } }
  const result = resolveExpression(data, "images.slice(0, settings.gallery.limit)")
  assert.deepStrictEqual(result, ["a.jpg"])
})

test("resolveExpression: resolves method calls as method arguments", () => {
  const data = { text: "hello world", query: " " }
  const result = resolveExpression(data, "text.slice(0, text.indexOf(query))")
  assert.strictEqual(result, "hello")
})

test("resolveExpression: path arguments work with includes", () => {
  const data = { tags: ["a", "b"], tag: "b" }
  assert.strictEqual(resolveExpression(data, "tags.includes(tag)"), true)
  assert.strictEqual(resolveExpression(data, "tags.includes(missing)"), false)
})

test("resolveExpression: unresolved path argument behaves like undefined", () => {
  const data = { images: ["a.jpg", "b.jpg"] }
  // slice(0, undefined) slices to the end, same as in JS
  const result = resolveExpression(data, "images.slice(0, limit)")
  assert.deepStrictEqual(result, ["a.jpg", "b.jpg"])
})

test("resolveExpression: quoted commas in arguments are not separators", () => {
  const data = { items: ["a", "b"], separator: ", " }
  const result = resolveExpression(data, "items.join(separator)")
  assert.strictEqual(result, "a, b")
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

test("resolveExpression: spreads array slices in an array literal", () => {
  const data = { images: ["a.jpg", "b.jpg", "c.jpg", "d.jpg", "e.jpg"] }
  const result = resolveExpression(
    data,
    "[...images.slice(1, 2), ...images.slice(4, 5)]",
  )
  assert.deepStrictEqual(result, ["b.jpg", "e.jpg"])
})

test("resolveExpression: mixes spread and single elements", () => {
  const data = { images: ["a.jpg", "b.jpg", "c.jpg"] }
  const result = resolveExpression(data, '[...images.slice(0, 2), "static.jpg"]')
  assert.deepStrictEqual(result, ["a.jpg", "b.jpg", "static.jpg"])
})

test("resolveExpression: spreads a whole array", () => {
  const data = { a: [1, 2], b: [3] }
  const result = resolveExpression(data, "[...a, ...b]")
  assert.deepStrictEqual(result, [1, 2, 3])
})

test("resolveExpression: spread of a nullish value adds nothing", () => {
  const data = { images: ["a.jpg"] }
  const result = resolveExpression(data, "[...missing, ...images]")
  assert.deepStrictEqual(result, ["a.jpg"])
})

test("resolveExpression: spread of a non-array keeps the value", () => {
  const data = { name: "John", tags: ["x"] }
  const result = resolveExpression(data, "[...name, ...tags]")
  assert.deepStrictEqual(result, ["John", "x"])
})

test("resolveExpression: spread supports fallbacks", () => {
  const data = { images: undefined, fallback: ["a.jpg"] }
  const result = resolveExpression(data, "[...images ?? fallback]")
  assert.deepStrictEqual(result, ["a.jpg"])
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

test("resolveExpression: || falls back for missing variable", () => {
  const result = resolveExpression({}, 'title || "Untitled"')
  assert.strictEqual(result, "Untitled")
})

test("resolveExpression: || falls back for an empty string", () => {
  const result = resolveExpression({ title: "" }, 'title || "Untitled"')
  assert.strictEqual(result, "Untitled")
})

test("resolveExpression: || falls back for zero and false", () => {
  assert.strictEqual(resolveExpression({ count: 0 }, "count || 10"), 10)
  assert.strictEqual(resolveExpression({ active: false }, "active || true"), true)
})

test("resolveExpression: || returns the first truthy operand", () => {
  const data = { nickname: "", name: "John" }
  const result = resolveExpression(data, 'nickname || name || "Guest"')
  assert.strictEqual(result, "John")
})

test("resolveExpression: || returns the last value when all are falsy", () => {
  const result = resolveExpression({ a: "", b: 0 }, "a || b")
  assert.strictEqual(result, 0)
})

test("resolveExpression: || works with paths and methods", () => {
  const data = { user: { name: "john" } }
  const result = resolveExpression(data, "nickname || user.name.toUpperCase()")
  assert.strictEqual(result, "JOHN")
})

test("resolveExpression: || works inside array literals", () => {
  const data = { a: "", b: "b.jpg" }
  const result = resolveExpression(data, '[a || "x.jpg", b || "y.jpg"]')
  assert.deepStrictEqual(result, ["x.jpg", "b.jpg"])
})

test("resolveExpression: ignores || inside quoted strings", () => {
  const result = resolveExpression({}, 'name || "a || b"')
  assert.strictEqual(result, "a || b")
})

test("resolveExpression: && returns the last operand when all are truthy", () => {
  const data = { user: { name: "John" }, active: true }
  const result = resolveExpression(data, "active && user.name")
  assert.strictEqual(result, "John")
})

test("resolveExpression: && returns the first falsy operand", () => {
  assert.strictEqual(resolveExpression({ a: "", b: "x" }, "a && b"), "")
  assert.strictEqual(resolveExpression({ a: 0, b: "x" }, "a && b"), 0)
  assert.strictEqual(resolveExpression({ b: "x" }, "a && b"), undefined)
})

test("resolveExpression: && works with methods and literals", () => {
  const data = { name: "john" }
  const result = resolveExpression(data, "name && name.toUpperCase()")
  assert.strictEqual(result, "JOHN")
})

test("resolveExpression: && works inside array literals", () => {
  const data = { a: "a.jpg", b: "" }
  const result = resolveExpression(data, '[a && "x.jpg", b && "y.jpg"]')
  assert.deepStrictEqual(result, ["x.jpg", ""])
})

test("resolveExpression: && binds tighter than ||", () => {
  // a || b && c is a || (b && c)
  const data = { a: "", b: "x", c: "y" }
  assert.strictEqual(resolveExpression(data, "a || b && c"), "y")
  assert.strictEqual(resolveExpression({ a: "z", b: "x", c: "y" }, "a || b && c"), "z")
  assert.strictEqual(resolveExpression({ a: "", b: "", c: "y" }, "a || b && c"), "")
})

test("resolveExpression: ignores && inside quoted strings", () => {
  const result = resolveExpression({}, 'name || "a && b"')
  assert.strictEqual(result, "a && b")
})

test("resolveExpression: mixing ?? and || resolves to undefined", () => {
  const data = { a: "x", b: "y", c: "z" }
  assert.strictEqual(resolveExpression(data, "a ?? b || c"), undefined)
  assert.strictEqual(resolveExpression(data, "a || b ?? c"), undefined)
})

test("resolveExpression: mixing ?? and && resolves to undefined", () => {
  const data = { a: "x", b: "y", c: "z" }
  assert.strictEqual(resolveExpression(data, "a ?? b && c"), undefined)
  assert.strictEqual(resolveExpression(data, "a && b ?? c"), undefined)
})

test("resolveExpression: ?? inside an array literal does not count as mixing", () => {
  const data = { images: null, fallback: ["a.jpg"] }
  const result = resolveExpression(data, '[images ?? "x.jpg"] || fallback')
  assert.deepStrictEqual(result, ["x.jpg"])
})

test("replaceVariables: || fallback replaces empty string in text", () => {
  const result = replaceVariables("Title: {title || 'Untitled'}", { title: "" })
  assert.strictEqual(result, "Title: Untitled")
})

test("replaceVariables: keeps placeholder for a mixed ?? and || expression", () => {
  const result = replaceVariables("{a ?? b || c}", { a: 1, b: 2, c: 3 })
  assert.strictEqual(result, "{a ?? b || c}")
})

test("resolveExpression: formats dates with toLocaleDateString", () => {
  const data = { post: { date: new Date("2026-07-22T10:00:00Z") } }
  const result = resolveExpression(data, "post.date.toLocaleDateString('pl-PL')")
  assert.strictEqual(result, "22.07.2026")
})

test("resolveExpression: formats dates with toISOString", () => {
  const data = { date: new Date("2026-07-22T10:00:00Z") }
  const result = resolveExpression(data, "date.toISOString()")
  assert.strictEqual(result, "2026-07-22T10:00:00.000Z")
})

test("resolveExpression: formats numbers with toLocaleString", () => {
  const data = { views: 1234567 }
  const result = resolveExpression(data, "views.toLocaleString('en-US')")
  assert.strictEqual(result, "1,234,567")
})

test("resolveExpression: invalid date does not throw with toISOString", () => {
  const data = { date: new Date("invalid") }
  const result = resolveExpression(data, "date.toISOString()")
  assert.strictEqual(result, undefined)
})

test("resolveExpression: adds a literal to a path", () => {
  assert.strictEqual(resolveExpression({ i: 0 }, "i + 1"), 1)
  assert.strictEqual(resolveExpression({ count: 5 }, "count - 2"), 3)
})

test("resolveExpression: arithmetic works with nested paths", () => {
  const data = { items: ["a", "b", "c"] }
  assert.strictEqual(resolveExpression(data, "items.length - 1"), 2)
})

test("resolveExpression: multiplication and division", () => {
  const data = { price: 10, quantity: 3, total: 30 }
  assert.strictEqual(resolveExpression(data, "price * quantity"), 30)
  assert.strictEqual(resolveExpression(data, "total / quantity"), 10)
})

test("resolveExpression: arithmetic precedence puts * before +", () => {
  const data = { a: 2, b: 3, c: 4 }
  assert.strictEqual(resolveExpression(data, "a + b * c"), 14)
  assert.strictEqual(resolveExpression(data, "a * b + c"), 10)
})

test("resolveExpression: same-precedence chains evaluate left to right", () => {
  const data = { a: 10, b: 3, c: 2 }
  assert.strictEqual(resolveExpression(data, "a - b - c"), 5)
  assert.strictEqual(resolveExpression(data, "a - b + c"), 9)
})

test("resolveExpression: + concatenates strings", () => {
  const data = { first: "John", last: "Doe" }
  assert.strictEqual(
    resolveExpression(data, "first + ' ' + last"),
    "John Doe",
  )
})

test("resolveExpression: arithmetic with a missing operand is undefined", () => {
  assert.strictEqual(resolveExpression({ i: 1 }, "i + missing"), undefined)
  assert.strictEqual(resolveExpression({}, "missing * 2"), undefined)
})

test("resolveExpression: non-numeric operands are undefined for - * /", () => {
  const data = { name: "John", count: 2 }
  assert.strictEqual(resolveExpression(data, "name - count"), undefined)
  assert.strictEqual(resolveExpression(data, "name * 2"), undefined)
})

test("resolveExpression: operators without spaces are not arithmetic", () => {
  const data = { "a+b": 7 }
  assert.strictEqual(resolveExpression({ i: 1 }, "i+1"), undefined)
})

test("resolveExpression: arithmetic combines with ??", () => {
  // ?? binds looser than arithmetic, like in JS
  assert.strictEqual(resolveExpression({}, "count ?? 0 + 1"), 1)
  assert.strictEqual(resolveExpression({ count: 5 }, "count ?? 0 + 1"), 5)
})

test("resolveExpression: arithmetic combines with ||", () => {
  const data = { page: 0 }
  assert.strictEqual(resolveExpression(data, "page || 1 + 1"), 2)
})

test("resolveExpression: ignores operators inside quoted strings", () => {
  const data = { items: ["a", "b"] }
  assert.strictEqual(resolveExpression(data, "items.join(' + ')"), "a + b")
})

test("replaceVariables: renders one-based loop counters", () => {
  const result = replaceVariables("{i + 1}. {name}", { i: 0, name: "First" })
  assert.strictEqual(result, "1. First")
})

test("resolveExpression: method arguments accept expressions", () => {
  const data = { a: [1, 2, 3], n: 3, m: 2 }
  assert.deepStrictEqual(resolveExpression(data, "a.slice(0, n - 1)"), [1, 2])
  assert.deepStrictEqual(
    resolveExpression({ a: [1, 2, 3], n: null, m: 2 }, "a.slice(0, n ?? m)"),
    [1, 2],
  )
})

// Security hardening
test("resolveExpression: blocks prototype-chain access", () => {
  assert.strictEqual(resolveExpression({ x: {} }, "x.constructor"), undefined)
  assert.strictEqual(
    resolveExpression({ x: {} }, "x.constructor.constructor"),
    undefined,
  )
  assert.strictEqual(resolveExpression({ x: {} }, "x.__proto__"), undefined)
  assert.strictEqual(resolveExpression({ x: {} }, "x.prototype"), undefined)
})

test("resolveExpression: blocks constructor as a bare variable", () => {
  assert.strictEqual(resolveExpression({}, "constructor"), undefined)
  assert.strictEqual(resolveExpression({}, "__proto__"), undefined)
})

test("resolveExpression: allows legitimate properties named like keywords siblings", () => {
  // "name", "length" etc are fine - only the three prototype keys are blocked
  assert.strictEqual(resolveExpression({ user: { name: "Jan" } }, "user.name"), "Jan")
  assert.strictEqual(resolveExpression({ items: [1, 2] }, "items.length"), 2)
})

test("resolveExpression: rejects oversized expressions", () => {
  const huge = "a".repeat(1001)
  assert.strictEqual(resolveExpression({ a: 1 }, huge), undefined)
})

test("resolveExpression: survives pathologically nested array literals", () => {
  const deep = "[".repeat(200) + "]".repeat(200)
  // The depth guard stops the recursion instead of overflowing the stack
  assert.doesNotThrow(() => resolveExpression({}, deep))
})

test("resolveExpression: survives an oversized nested literal without OOM", () => {
  const huge = "[".repeat(20000) + "]".repeat(20000)
  // The length guard rejects it before the O(n) scanners run
  assert.strictEqual(resolveExpression({}, huge), undefined)
})
