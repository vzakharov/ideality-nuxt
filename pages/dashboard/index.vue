<template>
  <Container>
    <h1>
      {{ user.slug }}’s dashboard
    </h1>
    <b-link variant="secondary" href="#" v-text="'Log out'"
      @click="$auth.logout()"
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

    methods: {
      map
    }

  }

</script>

<style>

</style>