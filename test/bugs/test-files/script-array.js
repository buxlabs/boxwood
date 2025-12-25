
    const { Html, Head, Body, Script } = require('../../../index.js')
    module.exports = () => {
      return Html([
        Head([]),
        Body([
          Script(["var x = ", "<div>", ";"])
        ])
      ])
    }
  