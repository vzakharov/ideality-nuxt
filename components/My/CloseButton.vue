<template functional>
  <b-button-close class="float-right">
    <nuxt-link class="nocolor"
      :to="props.to" 
      @click.prevent="props.onclick"
    >
      ×
    </nuxt-link>
  </b-button-close>
</template>

<script>

  export default {

    props: ['to', 'onclick']

  }

</script>