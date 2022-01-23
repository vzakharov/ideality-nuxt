<template>
  <a role="button" :class="{'nav-link dropdown-toggle':true, show: value}"
    @click.prevent="$emit('input', !value)"
    onclick="this.blur()"
  />
</template>

<script>
  export default {
    props: {
      value: {},
      variant: {
        default: 'secondary'
      }
    }

  }
</script>
