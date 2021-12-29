<template>
  <div>
    <Load store what='toolCategories' :fetch="() => bubble.go('getToolCategories')"/>
    <ObjectConfig
      v-bind="{value: settings}"
      :fields="{
        category: { choices: $store.state.toolCategories },
        runsLeft: '',
        inToolbox: 'boolean',
        isExample: 'boolean',
        isPublic: 'boolean',
        isTemplate: 'boolean',
        isNative: 'boolean',
        sortIndex: '',
      }"
    />
    <ObjectConfig
      :value="widget"
      :fields="{name:{}}"
    />
    <b-button class="mt-5" variant="danger"
      @click="$emit('please', destroy)"
    >
      Delete forever
    </b-button>
  </div>
</template>

<script>

  export default {

    props: ['widget'],

    data() {
      let settings = this.setDefaults(this.widget, {
        category: '',
        runsLeft: 1000,
        inToolbox: false,
        isExample: false,
        isPublic: false,
        isTemplate: false,
        isNative: false,
        sortIndex: 0,
      })

      return { settings }
    },

    methods: {

      async destroy() {
        if ( window.prompt('Are you sure? Type in DELETE to confirm') == 'DELETE' ) {
          await this.bubble.destroy('widget', this.widget)
          this.$emit('deleted')
        }
      }
      
    }
    
    
  }

</script>

<style>

</style>