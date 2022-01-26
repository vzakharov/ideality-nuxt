<template functional>
  <b-button
    size="sm"
    :variant="props.variant || 'outline-secondary'"
    :to="props.to"
    @click.prevent="props.onclick && props.onclick()"
    onclick="this.blur()"
  >
    <b-icon :icon="props.icon"/>
  </b-button>
</template>

<script>
  
  export default {

    props: ['icon', 'to', 'onclick', 'variant']

  }

</script>