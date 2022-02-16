<template>
  <b-button v-if="typeof _props.if === 'undefined' || _props.if"
    size="sm"
    :variant="( active ? '' : 'outline-' ) + variant"
    :to="to"
    @click="onclick && onclick()"
    onclick="this.blur()"
    v-bind="tooltip && {
      'v-b-tooltip.hover': true,
      title: tooltip
    }"
  >
    <b-icon :icon="icon"/>
    {{ text }}
  </b-button>
</template>

<script>

  import { objectify } from '~/plugins/helpers.js'

  export default {
    props: {...objectify(
      ['if', 'active', 'variant', 'to', 'onclick', 'icon', 'text', 'tooltip']
    ), 
      variant: {
        default: 'secondary'
      }
    }
    
  }

</script>