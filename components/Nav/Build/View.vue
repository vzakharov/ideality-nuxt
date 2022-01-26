<template>
  <MyToolbar :close="{ to: { name: 'ideas' } }">
    <MyNavButton v-for="item in [
        { icon: log(model.expanded) ? 'chevron-double-left' : 'chevron-double-right', onclick() { model.expanded = !model.expanded } },
        { icon: 'file-earmark', to: { name: 'i-new' }, variant: 'outline-primary' },
        { icon: 'link-45deg', to: { name: 'i-slug', params: build } },
      ]" 
      :key="item.icon"
      v-bind="item"
    />
  </MyToolbar>
</template>

<script>

  import header from '~/plugins/mixins/header'

  export default {

    props: ['build', 'model'],

    mixins: [ header ]

  }

</script>