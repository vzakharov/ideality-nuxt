<template>
  <MyToolbar :close="{ to: { name: 'ideas' } }" :items="[
      { if: !model.expanded, icon: 'chevron-double-right', onclick() { model.expanded = !model.expanded } },
      { icon: 'link-45deg', to: { name: 'i-slug', params: build } },
    ]" 
  />
</template>

<script>

  import header from '~/plugins/mixins/header'

  export default {

    props: ['build', 'model'],

    mixins: [ header ]

  }

</script>