const { join, dirname } = require('path')
const URL = require('url')

function getFullRemoteUrl (remoteUrl, path) {
  if (!remoteUrl) return path
  if (!isRemotePath(remoteUrl)) return path
  const result = remoteUrl.endsWith('.html')
    ? URL.parse(remoteUrl).protocol + '//' + join(URL.parse(remoteUrl).host, dirname(URL.parse(remoteUrl).pathname), path)
    : URL.parse(remoteUrl).protocol + '//' + join(URL.parse(remoteUrl).host, URL.parse(remoteUrl).pathname, path)
  return result
}

function isRemotePath (path) {
  if (!path) return false
  return path.startsWith('http://') || path.startsWith('https://')
}

module.exports = {
  getFullRemoteUrl,
  isRemotePath
}
