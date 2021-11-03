<template>
  <FullBox>
    <template v-if="!loggingIn">
      <div v-if="$auth.loggedIn">
        <p>Already logged in as {{ user.name || user.slug || user.id}}. <a href="#" @click.prevent="$auth.logout()">Log out?</a></p>
        <p>Or log in as someone else:</p>
      </div>
      <h4 v-else>Please log in to continue</h4>
    </template>
    <div :disabled="loggingIn">
      <form @submit.prevent="login">
        <ObjectConfig v-model="vm" :fields="{
          email: { type: 'email'},
          password: {type: 'password'}
        }"/>
        <button v-if="!loggingIn" :disabled="!email || !password" class="btn btn-primary mt-2" type="submit" v-text="'Log in'"/>
        <template v-else>
          <Loading message="Logging you in, hold on a sec..."/>
        </template>
      </form>
    </div>
  </FullBox>
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