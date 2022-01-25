<template>
  <b-row class="border-bottom bg-white py-1">
    <b-col>
      <b-button v-for="item in [
          { icon: 'file-earmark', to: { name: 'i-new' }, variant: 'outline-primary' },
          { icon: 'folder2-open', onclick() { model.expanded = !model.expanded }, variant: model.expanded && 'secondary' },
          { icon: 'link-45deg', to: { name: 'i-slug', params: build } },
        ]" 
        :key="item.icon"
        size="sm" :variant="item.variant || 'outline-secondary'" 
        :to="item.to"
        @click.prevent="item.onclick && item.onclick()"
      >
        <b-icon :icon="item.icon"/>
      </b-button>              
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