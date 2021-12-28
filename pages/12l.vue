<template>
  
</template>

<script>
  export default {

    middleware({ redirect, route: { query: { slug, secret }}}) {
      if ( slug && secret) {
        redirect({name: 'i-slug-section', params: { slug, section: 'edit' }, query: { secret }})
      } else {
        redirect({name: 'i-new'})
      }
    }

  }
</script>
