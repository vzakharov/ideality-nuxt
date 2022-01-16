<template>
  <b-form>
    <MyInput v-model="instruction"/>
    <b-button variant="primary" type="submit" :disabled="!instruction" @click.prevent="execute" v-text="'Execute'"/>
    <CodeInput v-if="result" v-model="result"/>
    <b-alert variant="danger" show v-if="error" v-text="error"/>
  </b-form>
</template>

<script>

  export default {
    
    data() {

      return {
        instruction: '',
        result: null,
        error: null
      }

    },

    methods: {

      async execute() {
        let { instruction, route: { params: { secret }}} = this
        try {
          let { data: { result } } = await this.$axios.post('api/terminal', {
            instruction, secret
          })
          this.error = null
          Object.assign(this, { result })
        } catch (error) {
          this.error = error.stack
          console.log(this.error)
        }
      }

    }

  }

</script>

<style>

</style>