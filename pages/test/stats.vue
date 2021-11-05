<template>
  <WidgetStats v-model="stats"/>
</template>

<script>

  export default {

    data() {
      return {
        stats: {
          events: [
            {user: 1, action: 'open'}, 
            {user:1, action: 'run'}, 
            {user:2, action: 'open'}, 
            {user:1, action:'open'},
            {user:2, action: 'run'},
            {user:2, action: 'cta'},
            {user:3, action: 'open'}
          ]
        }
      }
    }

  }

</script>

<style>

</style>