<script>

  export default {

    props: ['value', 'what', 'fetch', 'store'],

    mounted({ value, what, $store: { state, ...$store } } = this) {
      if ( !value && !state[what] )
        this.fetch().then(result => {
          if (this.hasProp('store'))
            $store.commit('set', result)
          else
            this.$emit('setFields', result)
        })
    },

    render() {}

  }

</script>
