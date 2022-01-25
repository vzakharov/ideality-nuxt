<template/>

<script>

  export default {
    middleware({ redirect }) {
      redirect({ name: 'ideas' })
    }
  }

</script>