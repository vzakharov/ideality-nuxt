<template>
<nav class="navbar navbar-expand-lg navbar-light sticky-top bg-light">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <b-dropdown v-if='$auth.loggedIn' variant='light' text="Projects" lazy>
          <FetchableItems type="project"/>
        </b-dropdown>
        <b-dropdown v-if='$auth.loggedIn' variant='light' text="Widgets" lazy>
          <FetchableItems type="widget"/>
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
    </div>
  </div>
</nav>
</template>

<script>

import Vue from 'vue'
import login from './login.vue'

export default {

  data() { return {
    email: '',
    password: '',
    token: null,
    user: {}
  }},

}
</script>

<style>

</style>