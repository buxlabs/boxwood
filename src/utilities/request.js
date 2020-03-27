'use strict'

const axios = require('axios')
const { cacheAdapterEnhancer } = require('axios-extensions')

const request = axios.create({
  headers: { 'Cache-Control': 'no-cache' },
  adapter: cacheAdapterEnhancer(axios.defaults.adapter)
})

module.exports = request
