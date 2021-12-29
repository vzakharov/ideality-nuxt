<template>
  <MyContainer>
    <WidgetStats :value="{widget}"/>
    <b-form
      @submit.prevent="$axios.post('api/widget/track', event)"
    >
      <MyForm
        v-model="event"
        :fields="{
          action: {}
        }"
      />
      <b-button variant="primary" v-text="'Submit'" type="submit"/>
    </b-form>

  </MyContainer>
</template>

<script>

  export default {

    data() {
      let widget = { id: '1634843315317x809437390242563100' }
      return {
        widget,
        event: {
          action: 'open',
          widget
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