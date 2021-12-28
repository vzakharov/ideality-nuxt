<template>
  <Container>
    <h1>{{ name }}</h1>
    <LabeledInput lazy caption='Name' v-model="name"/>
    <b-card no-body>
      <b-card-header>
        <b-nav card-header tabs>
          <b-nav-item v-for="s in ['assets', 'builds']" :key="s"
            :active="s == section"
            :to="appendRoute({ params: { section: s }})"
          >
            {{ capitalize(s )}}
          </b-nav-item>
        </b-nav>
      </b-card-header>

      <b-card-body>
        <Cards v-model="vm[section]" :type="singular(section)" :route-prefix="'builder-project-'+singular(section)"/>
      </b-card-body>
    </b-card>
  </Container>
</template>

<script>

  import { capitalize } from 'lodash'
  import { singular } from 'pluralize'
  import { appendRoute } from '~/plugins/helpers'
  
  export default {

    data() {
      return {
        name: null,
        slug: null,
        assets: [],
        builds: []
      }
    },
    
    async middleware({ redirect, route, route: { params: { section }} }) {
      if ( !section )
        redirect(appendRoute({ route, params: { section: 'assets' }}))
    },

    mounted({ $route: { params: { project: slug }}} = this) {
      this.syncLocal('builder', {
        parentPath: 'projects',
        where: { slug },
        slugifyName: true
      })
    },

    computed: {
      section() { return this.$route.params.section }
    },

    methods: {
      capitalize, singular
    }

  }

</script>

<style>

</style>