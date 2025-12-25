const { Markdown } = require("../../../ui")

// Default markdown content for testing
const DEFAULT_MARKDOWN = `
        # h1
        ## h2
        ### h3
        #### h4
        ##### h5
        ###### h6
        
        paragraph

        > blockquote
    `

module.exports = (text = DEFAULT_MARKDOWN) => {
  return Markdown(text)
}
