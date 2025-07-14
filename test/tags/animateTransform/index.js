const { AnimateTransform } = require("../../..")

module.exports = () => {
  return [AnimateTransform({"attributeName":"transform","type":"rotate","from":"0","to":"360","dur":"2s"})]
}