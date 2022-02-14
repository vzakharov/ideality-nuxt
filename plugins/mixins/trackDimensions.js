export default {

    data() {

      return {
        dimensions: { 
          top: null, left: null, height: null, witdth: null
        }
      }

    },

    mounted() {

      let observer = new ResizeObserver( ([{ target: { 
        offsetParent: parent, offsetTop: top, offsetLeft: left, offsetHeight: height, offsetWidth: width 
      } }]) => {
        while ( parent ) {
          top += parent.offsetTop
          left += parent.offsetLeft
          parent = parent.offsetParent
        }
        Object.assign(this.dimensions, { top, left, height, width })
      })

      observer.observe(this.$el)

      this.$once( 'hook:beforeDestroy', () => observer.disconnect() )

    }

}