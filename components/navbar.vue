<template>
<nav class="navbar navbar-expand-lg navbar-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <b-dropdown v-if='$auth.loggedIn' variant='light' text="Projects">
          <b-dropdown-item v-for='project in userProjects' :key='project._id' @click="$emit('openProject', project)">
            {{ project.name || project._id }}
          </b-dropdown-item>
        </b-dropdown>
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Link</a>
        </li>

        <li class="nav-item">
          <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
        </li>
      </ul>
      <span v-if='$auth.loggedIn'>Hello, {{ $auth.user.Slug }} <small><b-link class="link-secondary" href='#' @click='$auth.logout()'>(log out)</b-link></small></span>
      <b-dropdown v-if="!$auth.loggedIn" variant="light" text="Log in" right>
        <login/>
      </b-dropdown>
      <!-- <form class="d-flex">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form> -->
    </div>
  </div>
</nav>
</template>

<script>

import Vue from 'vue'
import AsyncComputed from 'vue-async-computed'
import login from './login.vue'

Vue.use (AsyncComputed)

export default {
  components: { login },
  data() { return {
    email: '',
    password: '',
    token: null,
    user: {}
  }},

  methods: {
  },

  computed: {
  },

  asyncComputed: {
    async userProjects() {
      // console.log('hello')
      if (!this.$auth.loggedIn)
        return false
      let response = await (
        await fetch(`https://ideality.app/version-test/api/1.1/obj/document/`, {
          headers: {
            'Authorization': this.$auth.strategy.token.get(),
            'Content-Type': 'application/json'
          }
        })
      ).json()
      return response.response.results
    }
  }
}
</script>

<style>

</style>