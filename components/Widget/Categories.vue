<script>

  export default {

    props: ['value'],

    fetch() {
      if (!this.value)
        this.bubble.go('getToolCategories').then(({ categories }) => {
          this.$emit('input', categories)
        })
    },

    render() {}

  }

</script>
