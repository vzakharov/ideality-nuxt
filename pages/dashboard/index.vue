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
    <div>
      <strong>TOTAL runs left</strong>:
        <Fetchable 
          :promise="bubble.get('user', user.id)" 
          v-model="userDetails"
        >
          {{ userDetails.runsLeft }}
        </Fetchable>
    </div>
  </Container>
</template>

<script>

  import { map } from 'lodash'

  export default {

    middleware: ['loggedIn', 'getUser'],

    data() {
      return {
        userDetails: {}
      }
    },

    methods: {
      map
    },

    created() {  },

  }

</script>

<style>

</style>