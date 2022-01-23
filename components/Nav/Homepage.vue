<template>
  <NavPublic>
    <template #subscript>
      <div class="small gray">
        <slot/>
      </div>
    </template>
    <b-navbar-nav>
      <b-nav-item-dropdown text="Products">
        <b-dropdown-item
          v-for="item in [
            { caption: 'Builder', to: { name: 'ideas-section' } },
            { caption: 'Widget', to: {name: 'widget' }},
            { caption: 'Studio', to: { name:'index', hash: '#studio' } }
          ]"
          :key="item.caption"
          :to="item.to"
        >
          {{ item.caption }}
        </b-dropdown-item>    
      </b-nav-item-dropdown>
      <b-nav-item-dropdown text="Services">
        <b-dropdown-item :to="{name: 'services-ai-consulting'}">
          AI consulting
        </b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>  
  </NavPublic>
</template>
