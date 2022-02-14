<template>
  <b-button v-if="typeof _props.if === 'undefined' || _props.if"
    size="sm"
    :variant="variant || 'outline-secondary'"
    :to="to"
    @click.prevent="onclick && onclick()"
    onclick="this.blur()"
  >
    <b-icon :icon="icon"/>
  </b-button>
</template>

<script>
export default {
  props: ['if', 'variant', 'to', 'onclick', 'icon']
  
}
</script>