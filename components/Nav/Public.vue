<template>
  <b-navbar sticky class="bg-retro px-2"> 
    <b-navbar-brand :to="{ name:'index' }">
      Ideality ▲
    </b-navbar-brand>
    <b-navbar-nav>
      <b-nav-item-dropdown text="Products">
        <b-dropdown-item
          v-for="item in [
            { caption: 'Widget', to: 'Widget' },
            { caption: 'Chat', to: { name:'index', hash: '#chat' } },
            { caption: 'Studio', to: { name:'index', hash: '#studio' } }
          ]"
          :key="item.caption"
          :to="item.to"
        >
          {{ item.caption }}
        </b-dropdown-item>    
      </b-nav-item-dropdown>
    </b-navbar-nav>
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