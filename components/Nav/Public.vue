<template>
  <b-navbar id="header" toggleable="sm" class="border-bottom bg-retro ps-3 px-2">
    <b-navbar-brand :to="{ name:'index' }">
      <span :class="{gray: section}"> {{ narrow && section ? '' : 'Ideality '}}▲ </span>
      <nuxt-link v-if="section" :to="target" class="nocolor" v-text="subsection || section"/>
    </b-navbar-brand>
    <b-navbar-nav class="me-auto" style="flex-direction:row">
      <slot name="custom-nav"/>
    </b-navbar-nav>
    <b-navbar-toggle target="navbar-collapse"/>
    <b-collapse id="navbar-collapse" is-nav>  
      <b-navbar-nav class="ms-auto">
        <b-nav-item-dropdown text="Tools">
          <b-dropdown-item
            v-for="item in [
              { caption: 'Builder', to: { name: 'ideas-section', params: { section: 'about' }} },
              { caption: 'Widget', to: {name: 'widget' }},
              { caption: 'Studio', to: { name:'index', hash: '#studio' } }
            ]"
            :key="item.caption"
            :to="item.to"
            :disabled="subsection == item.caption"
          >
            <span :class="{ 'fw-bold': subsection==item.caption }" v-text="item.caption"/>
          </b-dropdown-item>    
        </b-nav-item-dropdown>
        <b-nav-item-dropdown text="Services">
          <b-dropdown-item :to="{name: 'services-ai-consulting'}">
            AI consulting
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-form v-if="$auth.loggedIn">
          <b-button variant="outline-primary" :to="{name: 'dashboard'}">
            Dashboard
          </b-button>
        </b-nav-form>
        <!-- <b-nav-form v-else>
          <b-button variant="primary" :to="{name: 'request-access'}">
            Request access
          </b-button>
        </b-nav-form> -->
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
  export default {
    props: ['section', 'subsection', 'target'],

    mounted() {
      this.store.headerHeight = this.$el.offsetHeight
    }
  }
</script>


<style>
  .bg-retro {
    background-color: #FBF7EC
  }
</style>