const test = require('ava')
const compile = require('../../helpers/compile')
const path = require('path')
const { escape } = require('../../..')

test('img: width auto for png', async assert => {
  var { template } = await compile('<img src="../../fixtures/images/placeholder.png" width="auto" height="auto">', { paths: [__dirname] })
  assert.deepEqual(template({}, escape), '<img src="../../fixtures/images/placeholder.png" width="250" height="250">')
})

test('img: width auto for jpg', async assert => {
  var { template } = await compile('<img src="../../fixtures/images/placeholder.jpg" width="auto" height="auto">', { paths: [__dirname] })
  assert.deepEqual(template({}, escape), '<img src="../../fixtures/images/placeholder.jpg" width="250" height="250">')
})

test('img: width auto for svg', async assert => {
  var { template } = await compile('<img src="../../fixtures/images/placeholder.svg" width="auto" height="auto">', { paths: [__dirname] })
  assert.deepEqual(template({}, escape), '<img src="../../fixtures/images/placeholder.svg" width="400" height="100">')
})

test('img: size', async assert => {
  var { template } = await compile('<img src="../../fixtures/images/placeholder.svg" size="1600x800">', { paths: [__dirname] })
  assert.deepEqual(template({}, escape), '<img src="../../fixtures/images/placeholder.svg" width="1600" height="800">')
})

test('img[inline]: works for png', async assert => {
  var { template } = await compile(`<img src='./placeholder.png' inline>`, { paths: [path.join(__dirname, '../../fixtures/images')] })
  assert.deepEqual(template({}, escape), `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6BAMAAAB6wkcOAAAAG1BMVEXMzMyWlpa+vr6qqqqcnJyjo6O3t7exsbHFxcUJuPfiAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACLElEQVR4nO3WvY6bQBSG4WPWGEqPfzAldrJRShNF2ZSQ/9KscgEmWlkpsZQLAEXKdecMWAZtXA5N9D7FauGTODPDzMEiAAAAAAAAAAAAAAAAAAAAAAAAAAAA+D94bz8fRRpjTCwS5F9vxqHGphb5tarcVi+N2Yhsu+qFMYdbsddV941ZOy0emjcv9Lnlu9PppwTmR7m5Fc+Wp9OplnP0yjidfKCTSfdyPtqLJpKZXeB/4iDqhnKUMnZZ3V/osmdyTuxFqcte2HFs9W5x6ONgYeOZDsWPXFaf6lwmc0lre5Hqsp73tuhaX3Xdx3ftjO/0rQRLl9X9rH18IbZWkehM7ZQ9c/SXg9ifh9IthOd226kyk09P5lEk1yE0mb2VZtt4EE+/5OukXYhw5bh4mFdiT1Q1qN5ERTWIJ8YevFGqv1zrbn70iliMtOusArMaxNKsk3tTt5FxW3xmvkn4oG91OZh7mEeDWH7rQhT7MeaeXnax7qe+uhTxs1i34wjVfW0hrdD0e143/fJZLM18hD2ffrj8o7O6nnc98Jeed411Udyf93Blq9gOpp3s2uu0obat7hK3N8uD+17XdXD73Olm0Ofzarvo43ZYeTVCn492u12iJ+5PnvXfOB2Dv+5jPXGvn3S7Of/GTW2fmdvPuEn677uug9dut0s8078Lcf99n3SP976v3kv/2+Yc22bbx3Kff6xlhN82AAAAAAAAAAAAAAAAAAAAAAAAAACg9xcCzVRdbP7JlAAAAABJRU5ErkJggg==">`)
})

test('img[inline]: works for jpg', async assert => {
  var { template } = await compile(`<img src='./placeholder.jpg' inline>`, { paths: [path.join(__dirname, '../../fixtures/images')] })
  assert.deepEqual(template({}, escape), `<img src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA+Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBkZWZhdWx0IHF1YWxpdHkK/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgA+gD6AwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9MooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACoJ722tmCyyhWPbrU9VIrZYXuZp9h8xidx7L2BzQBOZoxAZt48sDduHPFV01Wyd1RZssxwBtPX8qohtuiXRGREZGEef7pI/+vVqG9tTIkZhePdwjPHgN9KALc9zDbKGmkCA9PenQzRzxiSJwynuKpogm1iZnG7yUVVB7Z5ogUQavNGgwskYkwOmc4oAv0VWvjOlsZLdsOh3EYzuHcVBFePeXUYt2xCq7pTgHk9FoA0Krf2haCbyvPXfnGPf61NKrNE6ocMVIB9DWfcQQWujmKQJu2YGB1f2/GgC/NNHbxGSVtqDqcZqGLUrSeVY45dzt0G0j+lVr1/L0618/OS8e/wBfU/yqa3vLeWcR+S8Uh5USJtJ+lAE1xeW9qQJpQpPQdT+lSo6yIHRgynoRVGzRZru7ncBmEhjGewFLYKIrm7t14RHDKPTIzQBfooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArJmmhuryRLmdUgibaIycbz3JrWqFrS2ZizW8RJOSSg5oAhmuoUszJEiTRIQCF6Af/Wqvf3MF1AkEDiSWR12he3PX2rRSKOJSscaop5IUYFIkEUbFo4kQnqVUCgCk0q2eqyNKdsc6DDHpkdqW1cXOozXKcxKgjVvXnJq88aSLtkRWX0YZFKqqihVUKo6ADAoAgvbgWtq0mMt0UepNUdPV7C5+yy4/fKHU/wC13FajxpIVLorFTkZGcGho0cqXRWKnKkjOD7UAEjiONnbooJNZVtLbSuLq7uI2lPKoW4j/AA9a1mUMpVgCCMEHvUP2O1/59of+/YoAZdXUcKQysgeJmHz/AN30NV7ieK6u7SOBg7rJvYrzhR15rQ2Js2bV2Yxtxxikjhjiz5caJnrtUCgChDPHZ3lzFOwQO/mIx6HPWpNOJlkubrBCyuNue4HGatyRRygCSNXA6bhmngAAADAFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q==">`)
})

test('img[inline]: works for svg', async assert => {
  var { template } = await compile(`<img src='./placeholder.svg' inline>`, { paths: [path.join(__dirname, '../../fixtures/images')] })
  assert.deepEqual(template({}, escape), `<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxMDAiIHN0eWxlPSJmaWxsOnJnYigwLDAsMjU1KTtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlOnJnYigwLDAsMCkiIC8+PC9zdmc+Cg==">`)
})

test('img[inline|progressive]: works for png', async assert => {
  var { template } = await compile(`<img src='./placeholder.png' inline progressive>`, { paths: [path.join(__dirname, '../../fixtures/images')] })
  assert.deepEqual(template({}, escape), `<img src="data:image/png;base64,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">`)
})

test('img[inline|progressive]: works for jpg', async assert => {
  var { template } = await compile(`<img src='./placeholder.jpg' inline progressive>`, { paths: [path.join(__dirname, '../../fixtures/images')] })
  assert.deepEqual(template({}, escape), `<img src="data:image/jpg;base64,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">`)
})

test('img[inline|progressive]: does not optimize svgs', async assert => {
  var { template, warnings } = await compile(`<img src='./placeholder.svg' inline progressive>`, { paths: [path.join(__dirname, '../../fixtures/images')] })
  assert.deepEqual(template({}, escape), `<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxMDAiIHN0eWxlPSJmaWxsOnJnYigwLDAsMjU1KTtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlOnJnYigwLDAsMCkiIC8+PC9zdmc+Cg==">`)
})

test('img: global inline for png', async assert => {
  var { template } = await compile(`<img src='./placeholder.png'>`, { paths: [ path.join(__dirname, '../../fixtures/images') ], inline: ['images'] })
  assert.deepEqual(template({}, escape), `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6BAMAAAB6wkcOAAAAG1BMVEXMzMyWlpa+vr6qqqqcnJyjo6O3t7exsbHFxcUJuPfiAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACLElEQVR4nO3WvY6bQBSG4WPWGEqPfzAldrJRShNF2ZSQ/9KscgEmWlkpsZQLAEXKdecMWAZtXA5N9D7FauGTODPDzMEiAAAAAAAAAAAAAAAAAAAAAAAAAAAA+D94bz8fRRpjTCwS5F9vxqHGphb5tarcVi+N2Yhsu+qFMYdbsddV941ZOy0emjcv9Lnlu9PppwTmR7m5Fc+Wp9OplnP0yjidfKCTSfdyPtqLJpKZXeB/4iDqhnKUMnZZ3V/osmdyTuxFqcte2HFs9W5x6ONgYeOZDsWPXFaf6lwmc0lre5Hqsp73tuhaX3Xdx3ftjO/0rQRLl9X9rH18IbZWkehM7ZQ9c/SXg9ifh9IthOd226kyk09P5lEk1yE0mb2VZtt4EE+/5OukXYhw5bh4mFdiT1Q1qN5ERTWIJ8YevFGqv1zrbn70iliMtOusArMaxNKsk3tTt5FxW3xmvkn4oG91OZh7mEeDWH7rQhT7MeaeXnax7qe+uhTxs1i34wjVfW0hrdD0e143/fJZLM18hD2ffrj8o7O6nnc98Jeed411Udyf93Blq9gOpp3s2uu0obat7hK3N8uD+17XdXD73Olm0Ofzarvo43ZYeTVCn492u12iJ+5PnvXfOB2Dv+5jPXGvn3S7Of/GTW2fmdvPuEn677uug9dut0s8078Lcf99n3SP976v3kv/2+Yc22bbx3Kff6xlhN82AAAAAAAAAAAAAAAAAAAAAAAAAACg9xcCzVRdbP7JlAAAAABJRU5ErkJggg==">`)
})

test('img: global inline for jpg', async assert => {
  var { template } = await compile(`<img src='./placeholder.jpg'>`, { paths: [ path.join(__dirname, '../../fixtures/images') ], inline: ['images'] })
  assert.deepEqual(template({}, escape), `<img src="data:image/jpg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gA+Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBkZWZhdWx0IHF1YWxpdHkK/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgA+gD6AwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9MooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACoJ722tmCyyhWPbrU9VIrZYXuZp9h8xidx7L2BzQBOZoxAZt48sDduHPFV01Wyd1RZssxwBtPX8qohtuiXRGREZGEef7pI/+vVqG9tTIkZhePdwjPHgN9KALc9zDbKGmkCA9PenQzRzxiSJwynuKpogm1iZnG7yUVVB7Z5ogUQavNGgwskYkwOmc4oAv0VWvjOlsZLdsOh3EYzuHcVBFePeXUYt2xCq7pTgHk9FoA0Krf2haCbyvPXfnGPf61NKrNE6ocMVIB9DWfcQQWujmKQJu2YGB1f2/GgC/NNHbxGSVtqDqcZqGLUrSeVY45dzt0G0j+lVr1/L0618/OS8e/wBfU/yqa3vLeWcR+S8Uh5USJtJ+lAE1xeW9qQJpQpPQdT+lSo6yIHRgynoRVGzRZru7ncBmEhjGewFLYKIrm7t14RHDKPTIzQBfooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArJmmhuryRLmdUgibaIycbz3JrWqFrS2ZizW8RJOSSg5oAhmuoUszJEiTRIQCF6Af/Wqvf3MF1AkEDiSWR12he3PX2rRSKOJSscaop5IUYFIkEUbFo4kQnqVUCgCk0q2eqyNKdsc6DDHpkdqW1cXOozXKcxKgjVvXnJq88aSLtkRWX0YZFKqqihVUKo6ADAoAgvbgWtq0mMt0UepNUdPV7C5+yy4/fKHU/wC13FajxpIVLorFTkZGcGho0cqXRWKnKkjOD7UAEjiONnbooJNZVtLbSuLq7uI2lPKoW4j/AA9a1mUMpVgCCMEHvUP2O1/59of+/YoAZdXUcKQysgeJmHz/AN30NV7ieK6u7SOBg7rJvYrzhR15rQ2Js2bV2Yxtxxikjhjiz5caJnrtUCgChDPHZ3lzFOwQO/mIx6HPWpNOJlkubrBCyuNue4HGatyRRygCSNXA6bhmngAAADAFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q==">`)
})

test('img: global inline for svg', async assert => {
  var { template } = await compile(`<img src='./placeholder.svg'>`, { paths: [ path.join(__dirname, '../../fixtures/images') ], inline: ['images'] })
  assert.deepEqual(template({}, escape), `<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxMDAiIHN0eWxlPSJmaWxsOnJnYigwLDAsMjU1KTtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlOnJnYigwLDAsMCkiIC8+PC9zdmc+Cg==">`)
})

test('img: makes image responsive when fluid attribute has been set', async assert => {
  var { template } = await compile(`<img src="./placeholder.png" fluid>`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<img src="./placeholder.png" style="max-width: 100%; height: auto;">')

  var { template } = await compile(`<img fluid src="./placeholder.png">`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<img src="./placeholder.png" style="max-width: 100%; height: auto;">')

  var { template } = await compile(`<img src="./placeholder.png" style="border-radius: 10px;" fluid>`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<img src="./placeholder.png" style="max-width: 100%; height: auto; border-radius: 10px;">')

  var { template } = await compile(`<img fluid src="./placeholder.png" style="border-radius: 10px;">`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<img src="./placeholder.png" style="max-width: 100%; height: auto; border-radius: 10px;">')

  var { template } = await compile(`<img src="./placeholder.png" responsive>`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<img src="./placeholder.png" style="max-width: 100%; height: auto;">')

  var { template } = await compile(`<img responsive src="./placeholder.png">`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<img src="./placeholder.png" style="max-width: 100%; height: auto;">')

  var { template } = await compile(`<img src="./placeholder.png" style="border-radius: 10px;" responsive>`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<img src="./placeholder.png" style="max-width: 100%; height: auto; border-radius: 10px;">')

  var { template } = await compile(`<img responsive src="./placeholder.png" style="border-radius: 10px;">`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<img src="./placeholder.png" style="max-width: 100%; height: auto; border-radius: 10px;">')
})

test('img: images can have a cover attribute', async assert => {
  var { template } = await compile(`<img src="./placeholder.png" cover>`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<img src="./placeholder.png" style="object-fit: cover; object-position: right top;">')
})

test('img: images can have a contain attribute', async assert => {
  var { template } = await compile(`<img src="./placeholder.png" contain>`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<img src="./placeholder.png" style="object-fit: contain; object-position: center;">')
})

test('img: does not show warning if the same image is used many times', async assert => {
  var { template , warnings } = await compile(`
    <main><img src="./placeholder.png" /></main>
    <footer><img src="./placeholder.png"/></footer>`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<main><img src="./placeholder.png"></main><footer><img src="./placeholder.png"></footer>')
  assert.deepEqual(warnings.length, 0)

  var { template } = await compile(`
    <main><img src="./placeholder.svg" /></main>
    <footer><img src="./placeholder.svg"/></footer>`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  assert.deepEqual(template({}, escape), '<main><img src="./placeholder.svg"></main><footer><img src="./placeholder.svg"></footer>')
  assert.deepEqual(warnings.length, 0)
})

test('img: does not show warning if the same inlined image is used many times', async assert => {
  const { template , warnings } = await compile(`
    <main><img src="./placeholder.png" inline /></main>
    <footer><img src="./placeholder.png" inline/></footer>`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  const result = template({}, escape)
  assert.truthy(result.includes('<main><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA'))
  assert.truthy(result.includes('<footer><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA'))
  assert.deepEqual(warnings.length, 0)
})

test('svg: does not show warning if the same inlined svg is used many times', async assert => {
  const { template , warnings } = await compile(`
    <main><svg from="./placeholder.svg" inline /></main>
    <footer><svg from="./placeholder.svg" inline /></footer>`, { paths: [path.join(__dirname, '..', '..', 'fixtures', 'images')] })
  const result = template({}, escape)
  assert.truthy(result.includes('<main><svg width="400" height="100">'))
  assert.truthy(result.includes('<footer><svg width="400" height="100">'))
  assert.deepEqual(warnings.length, 0)
})
