import test from 'ava'
import compile from '../../helpers/compile'
import path from 'path'

test('inline', async assert => {
  let template
  console.time('inline')

  template = await compile(`<script inline>const foo = "bar"</script>{foo}`)
  assert.deepEqual(template({}, html => html), 'bar')

  template = await compile(`<script inline>const year = () => 2018</script>{year()}`)
  assert.deepEqual(template({}, html => html), '2018')

  template = await compile(`<script inline>const foo = ['bar', 'baz']</script><for qux in foo>{qux}</for>`)
  assert.deepEqual(template({}, html => html), 'barbaz')

  template = await compile(`<script src="./foo.js" inline></script>`, { paths: [path.join(__dirname, '../../fixtures/scripts')] })
  assert.deepEqual(template({}, html => html), `<script>console.log('foo')\n</script>`)

  template = await compile(`<link href="./foo.css" inline>`, { paths: [path.join(__dirname, '../../fixtures/stylesheets')] })
  assert.deepEqual(template({}, html => html), '<style>.foo { color: red; }\n</style>')

  template = await compile(`<img src='./placeholder.png' inline>`, { paths: [path.join(__dirname, '../../fixtures/images')] })
  assert.deepEqual(template({}, html => html), `<img src="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6BAMAAAB6wkcOAAAAG1BMVEXMzMyWlpa+vr6qqqqcnJyjo6O3t7exsbHFxcUJuPfiAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACLElEQVR4nO3WvY6bQBSG4WPWGEqPfzAldrJRShNF2ZSQ/9KscgEmWlkpsZQLAEXKdecMWAZtXA5N9D7FauGTODPDzMEiAAAAAAAAAAAAAAAAAAAAAAAAAAAA+D94bz8fRRpjTCwS5F9vxqHGphb5tarcVi+N2Yhsu+qFMYdbsddV941ZOy0emjcv9Lnlu9PppwTmR7m5Fc+Wp9OplnP0yjidfKCTSfdyPtqLJpKZXeB/4iDqhnKUMnZZ3V/osmdyTuxFqcte2HFs9W5x6ONgYeOZDsWPXFaf6lwmc0lre5Hqsp73tuhaX3Xdx3ftjO/0rQRLl9X9rH18IbZWkehM7ZQ9c/SXg9ifh9IthOd226kyk09P5lEk1yE0mb2VZtt4EE+/5OukXYhw5bh4mFdiT1Q1qN5ERTWIJ8YevFGqv1zrbn70iliMtOusArMaxNKsk3tTt5FxW3xmvkn4oG91OZh7mEeDWH7rQhT7MeaeXnax7qe+uhTxs1i34wjVfW0hrdD0e143/fJZLM18hD2ffrj8o7O6nnc98Jeed411Udyf93Blq9gOpp3s2uu0obat7hK3N8uD+17XdXD73Olm0Ofzarvo43ZYeTVCn492u12iJ+5PnvXfOB2Dv+5jPXGvn3S7Of/GTW2fmdvPuEn677uug9dut0s8078Lcf99n3SP976v3kv/2+Yc22bbx3Kff6xlhN82AAAAAAAAAAAAAAAAAAAAAAAAAACg9xcCzVRdbP7JlAAAAABJRU5ErkJggg==">`)

  template = await compile(`<img src='./placeholder.svg' inline>`, { paths: [path.join(__dirname, '../../fixtures/images')] })
  assert.deepEqual(template({}, html => html), `<img src="data:image/svg+xml;base64, PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxMDAiIHN0eWxlPSJmaWxsOnJnYigwLDAsMjU1KTtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlOnJnYigwLDAsMCkiIC8+PC9zdmc+Cg==">`)

  template = await compile(`<img src='./placeholder.jpg' inline>`, { paths: [path.join(__dirname, '../../fixtures/images')] })
  assert.deepEqual(template({}, html => html), `<img src="data:image/jpg;base64, /9j/4AAQSkZJRgABAQEAYABgAAD//gA+Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBkZWZhdWx0IHF1YWxpdHkK/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgA+gD6AwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9MooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACoJ722tmCyyhWPbrU9VIrZYXuZp9h8xidx7L2BzQBOZoxAZt48sDduHPFV01Wyd1RZssxwBtPX8qohtuiXRGREZGEef7pI/+vVqG9tTIkZhePdwjPHgN9KALc9zDbKGmkCA9PenQzRzxiSJwynuKpogm1iZnG7yUVVB7Z5ogUQavNGgwskYkwOmc4oAv0VWvjOlsZLdsOh3EYzuHcVBFePeXUYt2xCq7pTgHk9FoA0Krf2haCbyvPXfnGPf61NKrNE6ocMVIB9DWfcQQWujmKQJu2YGB1f2/GgC/NNHbxGSVtqDqcZqGLUrSeVY45dzt0G0j+lVr1/L0618/OS8e/wBfU/yqa3vLeWcR+S8Uh5USJtJ+lAE1xeW9qQJpQpPQdT+lSo6yIHRgynoRVGzRZru7ncBmEhjGewFLYKIrm7t14RHDKPTIzQBfooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArJmmhuryRLmdUgibaIycbz3JrWqFrS2ZizW8RJOSSg5oAhmuoUszJEiTRIQCF6Af/Wqvf3MF1AkEDiSWR12he3PX2rRSKOJSscaop5IUYFIkEUbFo4kQnqVUCgCk0q2eqyNKdsc6DDHpkdqW1cXOozXKcxKgjVvXnJq88aSLtkRWX0YZFKqqihVUKo6ADAoAgvbgWtq0mMt0UepNUdPV7C5+yy4/fKHU/wC13FajxpIVLorFTkZGcGho0cqXRWKnKkjOD7UAEjiONnbooJNZVtLbSuLq7uI2lPKoW4j/AA9a1mUMpVgCCMEHvUP2O1/59of+/YoAZdXUcKQysgeJmHz/AN30NV7ieK6u7SOBg7rJvYrzhR15rQ2Js2bV2Yxtxxikjhjiz5caJnrtUCgChDPHZ3lzFOwQO/mIx6HPWpNOJlkubrBCyuNue4HGatyRRygCSNXA6bhmngAAADAFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q==">`)

  template = await compile(`<script src="./foo.js"></script>`, { paths: [path.join(__dirname, '../../fixtures/scripts')], inline: ['scripts'] })
  assert.deepEqual(template({}, html => html), `<script>console.log('foo')\n</script>`)

  template = await compile(`<link href="./foo.css">`, { paths: [path.join(__dirname, '../../fixtures/stylesheets')], inline: ['stylesheets'] })
  assert.deepEqual(template({}, html => html), `<style>.foo { color: red; }\n</style>`)

  template = await compile(`<img src='./placeholder.png'>`, { paths: [ path.join(__dirname, '../../fixtures/images') ], inline: ['images'] })
  assert.deepEqual(template({}, html => html), `<img src="data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6BAMAAAB6wkcOAAAAG1BMVEXMzMyWlpa+vr6qqqqcnJyjo6O3t7exsbHFxcUJuPfiAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACLElEQVR4nO3WvY6bQBSG4WPWGEqPfzAldrJRShNF2ZSQ/9KscgEmWlkpsZQLAEXKdecMWAZtXA5N9D7FauGTODPDzMEiAAAAAAAAAAAAAAAAAAAAAAAAAAAA+D94bz8fRRpjTCwS5F9vxqHGphb5tarcVi+N2Yhsu+qFMYdbsddV941ZOy0emjcv9Lnlu9PppwTmR7m5Fc+Wp9OplnP0yjidfKCTSfdyPtqLJpKZXeB/4iDqhnKUMnZZ3V/osmdyTuxFqcte2HFs9W5x6ONgYeOZDsWPXFaf6lwmc0lre5Hqsp73tuhaX3Xdx3ftjO/0rQRLl9X9rH18IbZWkehM7ZQ9c/SXg9ifh9IthOd226kyk09P5lEk1yE0mb2VZtt4EE+/5OukXYhw5bh4mFdiT1Q1qN5ERTWIJ8YevFGqv1zrbn70iliMtOusArMaxNKsk3tTt5FxW3xmvkn4oG91OZh7mEeDWH7rQhT7MeaeXnax7qe+uhTxs1i34wjVfW0hrdD0e143/fJZLM18hD2ffrj8o7O6nnc98Jeed411Udyf93Blq9gOpp3s2uu0obat7hK3N8uD+17XdXD73Olm0Ofzarvo43ZYeTVCn492u12iJ+5PnvXfOB2Dv+5jPXGvn3S7Of/GTW2fmdvPuEn677uug9dut0s8078Lcf99n3SP976v3kv/2+Yc22bbx3Kff6xlhN82AAAAAAAAAAAAAAAAAAAAAAAAAACg9xcCzVRdbP7JlAAAAABJRU5ErkJggg==">`)

  template = await compile(`<img src='./placeholder.svg'>`, { paths: [ path.join(__dirname, '../../fixtures/images') ], inline: ['images'] })
  assert.deepEqual(template({}, html => html), `<img src="data:image/svg+xml;base64, PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxMDAiIHN0eWxlPSJmaWxsOnJnYigwLDAsMjU1KTtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlOnJnYigwLDAsMCkiIC8+PC9zdmc+Cg==">`)

  template = await compile(`<img src='./placeholder.jpg'>`, { paths: [ path.join(__dirname, '../../fixtures/images') ], inline: ['images'] })
  assert.deepEqual(template({}, html => html), `<img src="data:image/jpg;base64, /9j/4AAQSkZJRgABAQEAYABgAAD//gA+Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBkZWZhdWx0IHF1YWxpdHkK/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgA+gD6AwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9MooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACoJ722tmCyyhWPbrU9VIrZYXuZp9h8xidx7L2BzQBOZoxAZt48sDduHPFV01Wyd1RZssxwBtPX8qohtuiXRGREZGEef7pI/+vVqG9tTIkZhePdwjPHgN9KALc9zDbKGmkCA9PenQzRzxiSJwynuKpogm1iZnG7yUVVB7Z5ogUQavNGgwskYkwOmc4oAv0VWvjOlsZLdsOh3EYzuHcVBFePeXUYt2xCq7pTgHk9FoA0Krf2haCbyvPXfnGPf61NKrNE6ocMVIB9DWfcQQWujmKQJu2YGB1f2/GgC/NNHbxGSVtqDqcZqGLUrSeVY45dzt0G0j+lVr1/L0618/OS8e/wBfU/yqa3vLeWcR+S8Uh5USJtJ+lAE1xeW9qQJpQpPQdT+lSo6yIHRgynoRVGzRZru7ncBmEhjGewFLYKIrm7t14RHDKPTIzQBfooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArJmmhuryRLmdUgibaIycbz3JrWqFrS2ZizW8RJOSSg5oAhmuoUszJEiTRIQCF6Af/Wqvf3MF1AkEDiSWR12he3PX2rRSKOJSscaop5IUYFIkEUbFo4kQnqVUCgCk0q2eqyNKdsc6DDHpkdqW1cXOozXKcxKgjVvXnJq88aSLtkRWX0YZFKqqihVUKo6ADAoAgvbgWtq0mMt0UepNUdPV7C5+yy4/fKHU/wC13FajxpIVLorFTkZGcGho0cqXRWKnKkjOD7UAEjiONnbooJNZVtLbSuLq7uI2lPKoW4j/AA9a1mUMpVgCCMEHvUP2O1/59of+/YoAZdXUcKQysgeJmHz/AN30NV7ieK6u7SOBg7rJvYrzhR15rQ2Js2bV2Yxtxxikjhjiz5caJnrtUCgChDPHZ3lzFOwQO/mIx6HPWpNOJlkubrBCyuNue4HGatyRRygCSNXA6bhmngAAADAFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//2Q==">`)

  try {
    template = await compile(`<img src='../circle.svg' inline>`)
  } catch (error) {
    assert.regex(error.message, /Compiler option is undefined: paths\./)
  }

  try {
    template = await compile(`<img src='../circle.svg' inline>`, { paths: [] })
  } catch (error) {
    assert.regex(error.message, /Asset not found: \.\.\/circle\.svg/)
  }

  try {
    template = await compile(`<script src='./foo.js' inline></script>`, { paths: [] })
  } catch (error) {
    assert.regex(error.message, /Asset not found: \.\/foo\.js/)
  }
  console.timeEnd('inline')
})
