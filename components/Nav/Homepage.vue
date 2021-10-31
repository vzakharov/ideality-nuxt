<template>
  <NavPublic>
    <b-navbar-nav>
      <b-nav-item-dropdown text="Products">
        <b-dropdown-item
          v-for="item in [
            { caption: 'Widget', to: 'widget' },
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
  </NavPublic>
</template>
