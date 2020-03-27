'use strict'

const { join, dirname } = require('path')
const { URL } = require('url')

function getFullRemoteUrl (remoteUrl, path) {
  if (!remoteUrl) return path
  if (!isRemotePath(remoteUrl)) return path
  if (isRemotePath(path)) return path
  const result = remoteUrl.endsWith('.html')
    ? new URL(remoteUrl).protocol + '//' + join(new URL(remoteUrl).host, dirname(new URL(remoteUrl).pathname), path)
    : new URL(remoteUrl).protocol + '//' + join(new URL(remoteUrl).host, new URL(remoteUrl).pathname, path)
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
