<template>
  <div>
    <b-container fluid>
      <b-row align-h="center" align-v="center" style="height:100vh" >
        <b-col align-self="center" class="bg-light p-3 border shadow" style="max-width:300px">
          <h4>Please log in to continue</h4>
          <div :disabled="loggingIn">
            <ObjectConfig v-model="vm" :fields="{
              email: { type: 'email'},
              password: {type: 'password'}
            }"/>
            <button v-if="!loggingIn" :disabled="!email || !password" @click.prevent="userLogin" class="btn btn-primary mt-2" type="button" v-text="'Log in'"/>
            <template v-else>
              <b-spinner small/>
              <em>Logging you in, hold on a sec...</em>
            </template>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
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
    userLogin() {
      this.loggingIn = true
      let { email, password } = this
      this.$auth.loginWith('local', { data: { email, password } })
      this.$router.push(this.$route)
    }
  }

}
</script>