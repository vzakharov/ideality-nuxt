<template>
  <h2 v-bind="{id}" class="mt-4">
    <slot/>
    <nuxt-link :to="{hash: id}">
      <small>#</small>
    </nuxt-link>
  </h2>
</template>

<script>

export default {
  
  computed: {
    id() {
      return this.$slots.default[0].text.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g,'')
    }
  }

}
</script>

<style scoped>
a {
  text-decoration: none;
  color: #ddd;
  font-size: smaller;
  margin-left: 10px;
}
</style>