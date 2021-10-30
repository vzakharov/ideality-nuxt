<template>
  <Authorized>
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
  </Authorized>
</template>

<script>

  import { map } from 'lodash'

  export default {

    methods: {
      map
    }

  }

</script>

<style>

</style>