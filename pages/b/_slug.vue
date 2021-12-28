<template>
  
</template>

<script>

  export default {

    middleware({ redirect, route: { params }}) {
      redirect({name: 'i-slug', params})
    }

  }

</script>