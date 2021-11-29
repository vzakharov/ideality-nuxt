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
    }
    
    
  }

</script>

<style>

</style>