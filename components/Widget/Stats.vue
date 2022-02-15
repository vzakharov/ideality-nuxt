<template>
  <div>
    <Loading v-if="!events" message="Loading events..."/>
    <template v-else>
      <b-table v-if="events.length"
        :items="actionCounts"
      >
      </b-table>
      <p v-else class="mt-4 text-center">
        <em>No events for this widget yet ¯\_(ツ)_/¯</em>
      </p>
    </template>
  </div>
</template>

<script>

  import { chain, uniqBy, map } from 'lodash'

  export default {

    props: ['value'],

    data() {
      let { events, widget } = this.value
      return {
        events, widget
      }
    },

    computed: {

      actionCountsByActor() {
        return chain(this.events)
          .groupBy('actor')
          .mapValues(theirEvents => chain(theirEvents)
            .countBy('action').value()).value()
      },

      actionCounts() {
        let actionCounts = chain(this.events)
          .groupBy('action')
          .mapValues(actions => 
            uniqBy(actions, 'actor')
            .length
          )
          .map((count, action) => 
            ({action, count})
          ).value()
        
        const conversionPercentage = ( item, i, j ) =>
          i ? `${Math.round(100*item.count/actionCounts[j].count)}%` : undefined

        actionCounts = map(actionCounts, ( item, i ) => ({
          ...item, 
          stepConversion: conversionPercentage(item, i, i-1),
          totalConversion: conversionPercentage(item, i, 0)
        }))

        return actionCounts
      }

    },

    async mounted() {
      let { widget } = this
      if ( widget ) {
        this.events = await this.bubble.get('widgetEvents', {
          widget
        })
        console.log(this.events)
      }
    }


  }


</script>