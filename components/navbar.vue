<template>
  <b-navbar toggleable="lg" type="light" variant="light" class="sticky-top">
    <a class="navbar-brand" href="#">Navbar</a>
    <b-navbar-toggle target="collapsed-menu">
      <span class="navbar-toggler-icon"></span>
    </b-navbar-toggle>
    <b-collapse id="collapsed-menu" is-nav>
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
    </b-collapse>
  </b-navbar>
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