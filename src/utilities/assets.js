function mergeAssets (assets) {
  const object = {}
  assets.forEach(asset => {
    const { path, files } = asset
    if (!path) return
    if (!object[path]) {
      object[path] = asset
    } else if (object[path].id < asset.id) {
      asset.files = [...object[path].files, ...files]
      object[path] = asset
    } else {
      object[path].files = [...object[path].files, ...files]
    }
  })
  return Object.values(object)
}

module.exports = { mergeAssets }
