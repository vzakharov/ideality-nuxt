<template>
  <Container>
    <h2>Your projects</h2>
    <b-row cols="1" cols-sm="2" cols-md="3" cols-lg="4" cols-xl="5" class="g-3">
      <b-col
        v-for="project in projects"
        :key="project.id"
      >
        <b-card :title="project.name || 'Untitled project'">
          <nuxt-link class="stretched-link" :to="{ name: 'builder-project', params: { project: project.id }}"/>
        </b-card>
        <b-button size="sm" variant="light" class="gray"
          @click="projects = without(projects, project)"
        >
          delete
        </b-button>
      </b-col>
      <b-col>
        <h5>Create new:</h5>
        <b-form>
          <ObjectConfig
            v-model="newProject"
            :key="newProject.id"
            :fields="{
              name: { placeholder: 'Enter name or keep empty'}
            }"
          />
          <b-button type="submit" variant="outline-primary"
            @click="
              projects=[...projects, newProject]
              newProject = getNewProject()
            "
          >
            Create
          </b-button>
        </b-form>
      </b-col>
    </b-row>
  </Container>
</template>

<script>

  import { without } from 'lodash'

  export default {

    data() {

      return {
        newProject: this.getNewProject(),
        projects: []
      }

    },

    mounted() {

      this.projects = JSON.parse(localStorage.getItem('builder.projects') || '[]')

    },

    watch: {
      projects(projects) {
        if (process.client)
          localStorage.setItem('builder.projects', JSON.stringify(projects))
      }
    },

    methods: {

      getNewProject() {
        return {
          id: Date.now().toString(),
          name: ''
        }
      },

      without
    }

  }

</script>

<style>

</style>