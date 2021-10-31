<template>
  <Box>
    <Loading message="Creating your new widget, hold on a sec..."/>
  </Box>
</template>

<script>

  import Bubble from '~/plugins/bubble'

  export default {

    middleware({ store: { $auth }, redirect, route: { query: { template }}}) {

      if ( !template )
        template = '1635634622693x282295039393485100'

      console.log({template})
      
      let bubble = new Bubble({$auth})
      bubble.go('createWidget', { template }).then(({ widget }) => {
        console.log(widget)
        redirect({name: 'dashboard-widget-id', params: {id: widget.id}})
      })


    }

  }

</script>

<style>

</style>