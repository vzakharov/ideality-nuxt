<template>
  <b-row cols="1" cols-sm="2" cols-md="3" cols-lg="4" cols-xl="5" class="g-3">
    <b-col
      v-for="item in value"
      :key="item.id"
    >
      <b-card :title="item.name || `Untitled ${type}`">
        <nuxt-link class="stretched-link" :to="{ name: routeName, params: params(item) }"/>
      </b-card>
      <b-button size="sm" variant="light" class="gray"
        @click="$emit('input', without(value, item))"
      >
        delete
      </b-button>
    </b-col>
    <b-col>
      <h5>Create new:</h5>
      <b-form>
        <ObjectConfig
          v-model="newItem"
          :key="newItem.id"
          :fields="{
            name: { placeholder: 'Enter name or keep empty'}
          }"
        />
        <b-button variant="outline-primary"
          @click="
            $emit('input', [...value, newItem])
            newItem = getNewItem()
          "
        >
          Create
        </b-button>
      </b-form>
    </b-col>
  </b-row>
</template>

<script>

  import { without } from 'lodash'

  export default {

    props: ['value', 'type', 'routePrefix'],

    data() {

      return {
        newItem: this.getNewItem()
      }

    },

    computed: {

      routeName() {
        return [this.routePrefix, this.type].join('-')
      }

    },

    methods: {      

      getNewItem() {
        return {
          id: Date.now().toString()
        }
      },

      params(item) {
        debugger
        let out = {}
        out[this.type] = item.id
        return out
      },

      without

    }

  }

</script>

<style>

</style>