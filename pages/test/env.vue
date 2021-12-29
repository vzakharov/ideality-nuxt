<template>
  <div>
    {{ text }}
  </div>  
</template>

<script>

  export default {

    data() {
      return {
        text: process.env.NUXT_ENV_BUBBLE_URL
      }
    }

  }

</script>