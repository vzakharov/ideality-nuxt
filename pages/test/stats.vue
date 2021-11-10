<template>
  <Container>
    <WidgetStats v-model="stats"/>
    <b-form
      @submit.prevent="$axios.post('api/widget/track', event)"
    >
      <ObjectConfig
        v-model="event"
        :fields="{
          action: {}
        }"
      />
      <b-button variant="primary" v-text="'Submit'" type="submit"/>
    </b-form>

  </Container>
</template>

<script>

  export default {

    data() {
      return {
        event: {
          action: 'open',
          widget: { id: '1634843315317x809437390242563100' }
        },
        stats: {
          events: [
            {actor:1, action: 'open'}, 
            {actor:1, action: 'run'}, 
            {actor:2, action: 'open'}, 
            {actor:1, action: 'open'},
            {actor:2, action: 'run'},
            {actor:2, action: 'cta'},
            {actor:3, action: 'open'}
          ]
        }
      }
    }

  }

</script>

<style>

</style>