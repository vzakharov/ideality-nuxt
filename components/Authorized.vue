<template>
  <div>
    <Login v-if="!$auth.loggedIn"/>
    <slot v-else/>
  </div>
</template>

<script>
export default {

}
</script>