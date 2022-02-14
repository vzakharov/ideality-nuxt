import { pick } from 'lodash'
import { objectify } from '~/plugins/helpers.js'

const keys = [
  'offsetTop', 'offsetLeft', 'offsetHeight', 'offsetWidth'
]

export default {

    data() {

      return {
        dimensions: objectify(keys, () => null)
      }

    },

    mounted() {

      let observer = new ResizeObserver( ([{ target }]) => 
        Object.assign(this.dimensions, pick(target, keys))
      )

      observer.observe(this.$el)

      this.$once( 'hook:beforeDestroy', () => observer.disconnect() )

    }

}