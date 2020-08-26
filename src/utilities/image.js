const sharp = require('sharp')

async function optimizeImageByProgressiveScan (buffer, type) {
  const method = type === 'png' ? 'png' : 'jpeg'
  return await sharp(buffer)[method]({ progressive: true }).toBuffer()
}

async function convertImageToProgressiveBase64 (keys, buffer, url) {
  if (!keys.includes('progressive')) { return null }
  if (url.includes('.jpg') || url.includes('.jpeg')) {
    return (await optimizeImageByProgressiveScan(buffer, 'jpg')).toString('base64')
  } else if (url.includes('.png')) {
    return (await optimizeImageByProgressiveScan(buffer, 'png')).toString('base64')
  }
  return null
}

module.exports = { optimizeImageByProgressiveScan, convertImageToProgressiveBase64 }
