export default {
  
  mounted() {
    this.store.headerHeight += this.$el.offsetHeight
  },

  beforeDestroy() {
    this.store.headerHeight -= this.$el.offsetHeight
  }

}