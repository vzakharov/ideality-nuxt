<template>
  <b-row cols="1" cols-sm="2" cols-md="3" cols-lg="4" cols-xl="5" class="g-3">
    <b-col
      v-for="item in items || []"
      :key="item.id"
    >
      <b-card>
        <template #header>
          <component :is="item.name ? 'strong' : 'em'" v-text="item.name || item.slug"/>
        </template>
        <nuxt-link class="stretched-link" :to="getRoute(item)"/>
      </b-card>
      <b-button size="sm" variant="light" class="gray"
        @click="$emit('input', without(items, item))"
      >
        delete
      </b-button>
    </b-col>
    <b-col>
      <p>Create new:</p>
      <b-form>
        <LabeledInput
          v-model="newItemName"
          placeholder="Enter name"
        />
        <b-button variant="outline-primary"
          type="submit"
          @click.prevent="create()"
        >
          Create
        </b-button>
      </b-form>
    </b-col>
  </b-row>
</template>

<script>

  import { find, kebabCase, without, values } from 'lodash'
  import { slugify } from '~/plugins/helpers'

  export default {

    props: ['value', 'type', 'routePrefix'],

    data() {

      return {
        newItemName: ''
      }

    },

    computed: {

      items() { return this.value },
      routeName() {
        return [this.routePrefix, this.type].join('-')
      }

    },

    methods: {      

      create({ newItemName: name, items } = this) {
        let slug = slugify(name || ( 'New ' + this.type ), items)
        let id = ( Date.now() + Math.random() ).toString()
        this.$emit('input', [ ...items, { id, slug, name } ])
        this.$router.push(this.getRoute({ slug }))
      },

      params({ id }) { return {
        [type]: id
      }},

      getRoute({ slug }, { routeName: name, type } = this) { return {
        name, params: { [type]: slug } 
      }},

      without, values

    }

  }

</script>

<style>

</style>