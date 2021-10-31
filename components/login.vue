<template>
  <Box>
    <template v-if="!loggingIn">
      <div v-if="$auth.loggedIn">
        <p>Already logged in as {{ user.name || user.slug || user.id}}. <a href="#" @click.prevent="$auth.logout()">Log out?</a></p>
        <p>Or log in as someone else:</p>
      </div>
      <h4 v-else>Please log in to continue</h4>
    </template>
    <div :disabled="loggingIn">
      <ObjectConfig v-model="vm" :fields="{
        email: { type: 'email'},
        password: {type: 'password'}
      }"/>
      <button v-if="!loggingIn" :disabled="!email || !password" @click.prevent="login" class="btn btn-primary mt-2" type="button" v-text="'Log in'"/>
      <template v-else>
        <Loading message="Logging you in, hold on a sec..."/>
      </template>
    </div>
  </Box>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      loggingIn: false
    }
  },

  methods: {

    async login() {
      this.loggingIn = true
      let { email, password } = this
      await this.$auth.loginWith('local', { data: { email, password } })
      let then = this.$route.query.then || { name: 'dashboard' }
      this.$router.push(then)
      // this.$emit('login')
    }

  }

}
</script>