<template>
  <b-textarea
    style="font-family: monospace!important; font-size: smaller; height: 70vh"
    class="text-monospace w-100"
    rows="25"
    v-bind="{value}"
    @change="$emit('input', $event)"
    lazy
  />
</template>

<script>

  export default {

    props: ['value']

  }

</script>