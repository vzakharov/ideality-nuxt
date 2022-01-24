<template>
  <li class="nav-item b-nav-dropdown dropdown align-self-center">
    <b-button v-bind="{size}" :variant="value ? 'secondary' : 'outline-secondary'" 
      class="dropdown-toggle" v-text="text" 
      @click.prevent="$emit('input', !value)"
    />
  </li>
</template>

<script>

  export default {

    props: ['value', 'size', 'text']
    
  }

</script>

<style>

</style>