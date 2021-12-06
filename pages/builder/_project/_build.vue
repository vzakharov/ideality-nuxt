<template>
  <div>
    <Build :args="$data"/>
  </div>
</template>

<script>

  export default {

    data() {

      return {
        code: null
      }
      
    },

    mounted() {
      this.code = localStorage.getItem('builder.code')
    },

    watch: {

      code() {

        if ( process.client ) {
          localStorage.setItem('builder.code', this.code)
        }

      }

    }

  }


</script>

<style>

</style>