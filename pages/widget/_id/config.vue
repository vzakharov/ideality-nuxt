<template>
  <div>
    <div v-if="!canAdmin">
      You don’t have access to edit this widget.
    </div>
    <template v-else>
      <WidgetConfig v-model="widget" v-bind="{id: widget.id}"
        v-on="{
          deleted: () => { $router.push({name: 'dashboard'}) }
        }"
      />
    </template>
  </div>
</template>

<script>

import { assign, get } from 'lodash'
import Bubble from '@/plugins/bubble'

export default {

  middleware: ['loggedIn'],

  head() { return {
    title: `${get(this, 'widget.name') } 🔺 Ideality widget`
  }},

  data() { 

    return {
      editing: true
    }
    
  },

  asyncData: Bubble.asyncData('widget'),

  computed: {
    canAdmin() { return this.isAdmin || get(this, '$auth.user.id') == get(this, 'widget.owner') }
  },

  mounted() {
    window.vm = this
  },

  watch: {
    async '$auth.user.id'(id) {
      if (id) {
        let { widget } = await Bubble.asyncData('widget')(this)
        assign(this, {widget})
      }
    }
  }

}

</script>