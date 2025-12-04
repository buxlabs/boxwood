const { Markdown } = require("../../../ui")

module.exports = () => {
  return Markdown(`
        # h1
        ## h2
        ### h3
        #### h4
        ##### h5
        ###### h6
        
        paragraph

        > blockquote
    `)
}
