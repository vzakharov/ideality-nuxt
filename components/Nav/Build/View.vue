<template>
  <b-row class="border-bottom bg-white py-1">
    <b-col>
      <MyNavButton v-for="item in [
          { icon: 'file-earmark', to: { name: 'i-new' }, variant: 'outline-primary' },
          { icon: model.expanded ? 'folder2-open' : 'folder', onclick() { model.expanded = !model.expanded } },
          { icon: 'link-45deg', to: { name: 'i-slug', params: build } },
        ]" 
        :key="item.icon"
        v-bind="{item}"
      />
      <b-button-close class="float-right">
        <nuxt-link :to="{name:'ideas'}" class="nocolor">
          ×
        </nuxt-link>
      </b-button-close>
    </b-col>
  </b-row>
</template>

<script>

  import header from '~/plugins/mixins/header'

  export default {

    props: ['build', 'model'],

    mixins: [ header ]

  }

</script>