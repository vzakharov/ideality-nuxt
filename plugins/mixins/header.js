import { sumBy } from 'lodash'

export default {

  data() {
    return {
      height: null
    }
  },

  mounted() { 
    let { $el } = this
    this.height = $el.offsetHeight
    this.recountNavHeight()

    const observer = new ResizeObserver(this.recountNavHeight)

    observer.observe($el)
  },

  beforeDestroy() { this.recountNavHeight() },

  methods: {

    recountNavHeight() {
      // console.log(...arguments)
      this.$store.commit('setFields', ['navHeights', {
        [this._uid]: this.$el.offsetHeight
      }])
    }

  }

}