<template>
  <div style="width:240px;" class="p-2">
    <div>
      <label>Email</label>
      <b-input type="email" v-model="login.email" />
    </div>
    <div>
      <label>Password</label>
      <b-input type="password" v-model="login.password" />
    </div>
    <div>
      <button @click.prevent="userLogin" class="btn btn-primary mt-2" type="button" v-text="'Submit'"/>
    </div>
  </div>
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
    userLogin() {
      return this.$auth.loginWith('local', { data: this.login })
    }
  }
}
</script>