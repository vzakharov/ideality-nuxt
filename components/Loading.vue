<template>
  <div>
    <b-spinner small/>&nbsp;<em v-text="message"/>
  </div>
</template>

<script>
export default {
  props: ["message"]
}
</script>