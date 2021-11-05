<template>
  <div>
    <b-table
      :items="actionCounts"
    >
    </b-table>
  </div>
</template>

<script>

  import { chain, uniqBy, map } from 'lodash'

  export default {

    props: ['value'],

    data() {
      return {
        ...this.value
      }
    },

    computed: {

      actionCountsByUser() {
        return chain(this.events)
          .groupBy('user')
          .mapValues(theirEvents => chain(theirEvents)
            .countBy('action').value()).value()
      },

      actionCounts() {
        let actionCounts = chain(this.events)
          .groupBy('action')
          .mapValues(actions => 
            uniqBy(actions, 'user')
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

    }


  }


</script>

<style>

</style>