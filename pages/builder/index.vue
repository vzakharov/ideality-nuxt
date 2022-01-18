<template>
  <MyContainer>
    <h2>Your projects</h2>
    <Cards v-model="projects" type="project" route-prefix="builder"/>
  </MyContainer>
</template>

<script>

  import { dump } from 'js-yaml'
  import { get } from 'lodash'
  
  export default {

    data() { 
      return {
        projects: []
      }
    },

    mounted() {
      this.syncLocal('builder', { inline: true })
    }

  }

</script>