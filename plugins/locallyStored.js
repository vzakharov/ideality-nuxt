import jsyaml from 'js-yaml'
import { plural } from 'pluralize'
import { find } from 'lodash'

export default (key, { path, format } = {}) => {

  format = format || 'yaml'

  const load = format == 'yaml' ? jsyaml.load : JSON.parse
  const dump = format == 'yaml' ? jsyaml.dump : JSON.stringify

  let $stored
  console.log({$stored})

  return {

    mounted() {
      if ( process.client ) {
        // debugger
        let data = localStorage.getItem(key)
        data = load(data)

        if ( path ) {
          if ( path ) {
            for ( let stop of path ) {
              data = find(data[plural(stop)], { id: this.$route.params[stop] })
            }
          }
        }

        Object.assign(this.$data, data)

        $stored = this.$data

        this.$watch('$stored', {
          deep: true,
          handler(value) {
            if ( process.client )
              localStorage.setItem(key, dump(value))
          }
        })

      }
        
    },

    computed: {

      $stored() { return $stored }
      
    }

  }
}