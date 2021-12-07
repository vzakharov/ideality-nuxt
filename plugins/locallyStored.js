import jsyaml from 'js-yaml'

export default (key, format = 'yaml') => {

  const load = format == 'yaml' ? jsyaml.load : JSON.parse
  const dump = format == 'yaml' ? jsyaml.dump : JSON.stringify

  return {

    mounted() {
      if ( process.client ) {
        let stored = localStorage.getItem(key)
        if ( stored ) {
          Object.assign(this.$data, load(stored))
        }
      }
        
    },

    watch: {
      $data: {
        deep: true,
        handler (value) {
          if ( process.client )
            localStorage.setItem(key, dump(value))
        }
      }
    },

  }
}