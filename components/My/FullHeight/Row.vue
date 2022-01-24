<template>
  <MyFullHeight tag="b-row" v-bind="$props">
    <slot/>
  </MyFullHeight>
</template>

<script>
export default {
  props: ['align-v']
}
</script>