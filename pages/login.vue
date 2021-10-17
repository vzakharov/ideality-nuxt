<template>
  <div>
    <Login v-if="!$auth.loggedIn"/>
    <div v-else>
      Already logged in as {{ $auth.user.Slug }}. <a href="#" @click.prevent="$auth.logout()">Log out?</a>
    </div>
  </div>
</template>

<script>

</script>

<style>

</style>