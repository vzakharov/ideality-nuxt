<template>
  <div>
    <ObjectConfig
      :value="settings"
      :fields="{
        straightToPreview: { advanced: true, caption: 'Straight to preview', type: 'boolean'},
        componentName: 'Component name'
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
          componentName: '',
          straightToPreview: false,
        })
      })


      return { settings }
    }

  }

</script>