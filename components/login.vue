<template>
  <b-form @submit.prevent="userLogin" style="width:240px;" class="p-2">
    <div>
      <label>Email</label>
      <b-input type="email" v-model="login.email" />
    </div>
    <div>
      <label>Password</label>
      <b-input type="password" v-model="login.password" />
    </div>
    <div>
      <button class="btn btn-primary mt-2" type="button">Submit</button>
    </div>
  </b-form>
</template>

<script>
export default {
  data() {
    return {
      login: {
        email: '',
        password: ''
      }
    }
  },
  methods: {
    async userLogin() {
      try {
        let response = await this.$auth.loginWith('local', { data: this.login })
        console.log(this.$auth.user)
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>