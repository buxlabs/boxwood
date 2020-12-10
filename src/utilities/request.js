'use strict'

const axios = require('axios')
const { cacheAdapterEnhancer } = require('axios-extensions')

// @ts-ignore
const request = axios.create({
  headers: { 'Cache-Control': 'no-cache' },
  // @ts-ignore
  adapter: cacheAdapterEnhancer(axios.defaults.adapter)
})

module.exports = request
