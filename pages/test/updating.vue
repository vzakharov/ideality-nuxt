<template>
  <b-container>
    <button @click='value=1' v-text="'Click me'"/>
    <div>Last updated: {{ lastUpdated }} (value: {{ value }})</div>
  </b-container>

</template>

<script>
export default {
  data() {
    return {
      value: 0
    }
  },

  computed: {
    lastUpdated() {
      if ( this.value )
        return Date.now()
    }
  }
}
</script>