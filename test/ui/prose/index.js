const { Prose } = require("../../../ui")

// Default prose content for testing
const DEFAULT_PROSE = `
        # h1
        ## h2
        ### h3
        #### h4
        ##### h5
        ###### h6
        
        paragraph

        > blockquote
    `

module.exports = (text = DEFAULT_PROSE) => {
  return Prose(text)
}
