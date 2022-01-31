export default {

  created() {
    this.$emit('created', this)
  },

  mounted() {
    this.$emit('mounted', this)
  }

}