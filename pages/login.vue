<template>
  <div class="p-2">
    <div v-if="$auth.loggedIn">
      <p>Already logged in as {{ user.name || user.slug || user.id}}. <a href="#" @click.prevent="$auth.logout()">Log out?</a></p>
      <p>Or log in as someone else:</p>
    </div>
    <Login/>
  </div>
</template>

<script>

</script>

<style>

</style>