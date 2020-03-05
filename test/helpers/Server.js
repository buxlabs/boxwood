const express = require('express')

module.exports = class Server {
  async start () {
    this.app = express()
    this.app.get('/ping', (req, res) => {
      res.send('pong')
    })
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(0, err => {
        if (err) return reject(err)
        resolve(this.server.address())
      })
    })
  }

  async stop () {
    return new Promise(resolve => {
      this.server.close(resolve)
    })
  }

  get (path, callback) {
    this.app.get(path, callback)
  }
}
