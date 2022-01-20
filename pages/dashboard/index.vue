<template>
  <MyContainer style="max-width:800px">
    <b-row align-h="center">
      <b-col cols="12" class="border bg-light p-3">
        <h1>
          {{ $auth.user.slug }}’s dashboard
        </h1>
        <a class="link-secondary small" href="#" v-text="'Log out'"
          @click="$auth.setUser(null); $auth.logout()"
        />
        <MyHeading>
          Widgets
        </MyHeading>
        <WidgetNewPicker/>
        <WidgetTable/>
        <div>
          <strong>TOTAL runs left</strong>:
            <Fetchable 
              :promise="bubble.get('user', $auth.user.id)" 
              v-model="userDetails"
            >
              {{ userDetails.runsLeft }}
            </Fetchable>
        </div>
      </b-col>
    </b-row>
  </MyContainer>
</template>

<script>

  export default {

    middleware: ['loggedIn'],

    data() {
      return {
        userDetails: {}
      }
    }

  }

</script>