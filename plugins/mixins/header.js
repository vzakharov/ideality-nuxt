import { sumBy } from 'lodash'

export default {

  data() {
    return {
      height: null
    }
  },

  mounted() { 
    this.height = this.$el.offsetHeight
    this.recountNavHeight(+1) 
  },

  beforeDestroy() { this.recountNavHeight(-1) },

  methods: {

    recountNavHeight(direction) {
      this.log(this.store.navHeight += direction * this.height)
    }

  }

}