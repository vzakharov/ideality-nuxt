<template>
  <b-navbar sticky class="bg-retro px-2"> 
    <b-navbar-brand :to="{ name:'index' }">
      Ideality ▲
    </b-navbar-brand>
    <slot/>
    <b-navbar-nav  class="ms-auto">
      <b-nav-form v-if="$auth.loggedIn">
        <b-button variant="outline-primary" to="dashboard">
          Dashboard
        </b-button>
      </b-nav-form>
      <b-nav-form v-else>
        <b-button variant="primary" to="request-access">
          Request access
        </b-button>
      </b-nav-form>
    </b-navbar-nav>
  </b-navbar>
</template>

<style>
  .bg-retro {
    background-color: #FBF7EC
  }
</style>