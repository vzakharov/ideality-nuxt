<template>
  <Container>
    <Breadcrumbs/>
    <div class="border bg-light p-3">
      <h1>
        {{ user.slug }}’s dashboard
      </h1>
      <Heading>
        Widgets
      </Heading>
      <WidgetTable/>
    </div>
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