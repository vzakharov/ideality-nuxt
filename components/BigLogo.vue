<template>
  <img src="/image.svg" 
    :style="{
      width: '300px', 
      transform: !rotate && 'rotate(180deg)',
      animation: rotate && `rotation ${rotate_period}s infinite linear`
    }" 
    @click="counter++; if ( counter > 3 ) $router.push('login')"
  />
    <!-- @click="rotate=true; rotate_period -= 2; counter++; if ( counter > 3 ) $router.push('login')" -->
</template>

<script>

  export default {
  
    data() {
      return {
        rotate: false,
        rotate_period: 60,
        counter: 0
      }
    }

  }

</script>


<style>
  @keyframes rotation {
    from {
      transform: rotate(180deg);
    }

    to {
      transform: rotate(359deg);
    }
  }
</style>