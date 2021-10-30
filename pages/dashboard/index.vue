<template>
  <Container>
    <h1>
      {{ user.slug }}’s dashboard
    </h1>
    <a class="link-secondary small" href="#" v-text="'Log out'"
      @click="$auth.setUser(null); $auth.logout()"
    />
    <Heading>
      Widgets
    </Heading>
    <WidgetNewPicker/>
    <WidgetTable/>
  </Container>
</template>

<script>

  import { map } from 'lodash'

  export default {

    middleware: 'loggedIn',

    methods: {
      map
    },

    created() {  }

  }

</script>

<style>

</style>