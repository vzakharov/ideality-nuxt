<template/>

<script>

  export default {
    middleware({ redirect }) {
      redirect({name: 'ideas-section', params: { section: 'top' }})
    }
  }

</script>