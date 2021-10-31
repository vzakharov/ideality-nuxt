<template>
  <NavPublic>
    <b-navbar-nav>
      <b-nav-item-dropdown text="Widget">
        <b-dropdown-item
          v-for="item in [
            'examples', 'your-case', 'setup', 'pricing', 'access'
          ].map(section => ({
            to: {
              name: 'widget',
              hash: '#'+section
            }, 
            caption: upperFirst(section).replace(/-/g, ' ')
          }))"
          :key="item.caption"
          :to="item.to"
        >
          {{ item.caption }}
        </b-dropdown-item>    
      </b-nav-item-dropdown>
    </b-navbar-nav>  
  </NavPublic>
</template>

<script>
import { upperFirst } from 'lodash'

export default {

  methods: { upperFirst }
}

</script>

