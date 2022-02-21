<template>
  <div>
    <a v-if="id" class="anchor" :id="_id"/>
    <component :is="tag" class="mt-4 mb-3">
      <slot/>
      <nuxt-link v-if="id" :to="{hash: _id}">
        <small>#</small>
      </nuxt-link>
    </component>
  </div>
</template>

<script>

export default {
  
  props: {
    id: {},
    tag: {
      default: 'h2'
    }
  },

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