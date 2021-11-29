<template>
  <div>
    <ObjectConfig
      :value="settings"
      :fields="{
        componentName: {}
      }"
    />
  </div>
</template>

<script>

  export default {

    props: ['widget'],

    data() {

      let { native: settings } = this.setDefaults(this.widget.display, {
        native: this.setDefaults({}, {
          componentName: ''
        })
      })


      return { settings }
    }

  }

</script>

<style>

</style>