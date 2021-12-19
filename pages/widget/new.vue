<template>
  <FullBox>
    <Loading message="Creating your new widget, hold on a sec..."/>
  </FullBox>
</template>

<script>

  import Bubble from '~/plugins/bubble'

  export default {

    middleware({ store: { $auth }, redirect, route: { query: { template }}}) {

      if (!$auth.loggedIn) {
        return redirect({ name: 'login' })
      }

      if ( !template )
        template = '1635634622693x282295039393485100'

      console.log({template})
      
      let bubble = new Bubble({$auth})
      bubble.go('createWidget', { template }).then(({ widget }) => {
        console.log({created: widget})
        redirect({name: 'widget-id-config', params: {id: widget.slug}})
      })


    }

  }

</script>

<style>

</style>