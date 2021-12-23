export default {
  computed: {

    regex() {
      return new RegExp(this.pattern.replace(/([\S\s]*?)%(\w+)(.*$)?/g, '(?:$1(?<$2>.*?)$3)?')+'$')
    }
    
  },

  watch: {

    content: {

      immediate: true,
      deep: true,
      handler(content) {
        if ( typeof content !== 'string' )
          content = content.output

        try {
          let match = content?.match(this.regex)
          

          console.log(this.regex, match)
          if ( match ) {

            let { groups } = match
            

            Object.assign(this, groups, { loaded: true })
          }        
        } catch(error) {
          console.log({error})
          this.loaded = false
        }
      }
      
    }

  }
}