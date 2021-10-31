<template>
  <div>
    <a class="anchor" :id="_id"/>
    <h2 class="mt-4">
      <slot/>
      <nuxt-link :to="{hash: id}">
        <small>#</small>
      </nuxt-link>
    </h2>
  </div>
</template>

<script>

export default {
  
  props: ["id"],

  computed: {
    _id() {
      return this.id || this.$slots.default[0].text.trim()
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

a.anchor {
  display: block;
  position: relative;
  top: -70px;
  visibility: hidden;
}
</style>