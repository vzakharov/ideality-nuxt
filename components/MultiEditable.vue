<template>
    <div :contenteditable="!readonly"
      :id="idfy('editor')"
      ref="editor"
      :style="{
        display: 'inline',
        outline: 'none',
        'white-space': 'pre-wrap'
      }"
      @input="process"
    >
      <span
        :style="item.id == currentId && !readonly && { color: 'blue' }"
        :id="idfy(item.id)" v-for="item in clonedItems" :key="item.id" v-text="item.text"
      />
    </div>  
</template>

<script>

  import { getCaretPosition, jsonClone } from '~/plugins/helpers.js'
  import { sumBy } from 'lodash'

  export default {

    props: ['items', 'readonly', 'setId'],

    data() {
      return {
        clonedItems: jsonClone(this.items),
        caretPosition: null,
        currentId: null
      }
    },

    mounted() {

      let callback = () => {
        let { editor } = this.$refs
        if ( document.activeElement == editor)
          this.caretPosition = getCaretPosition(editor)
      }

      document.addEventListener('selectionchange', callback)

      this.$once('hook:beforeDestroy', () =>
        document.removeEventListener('selectionchange', callback)
      )

      this.$watch('setId', { immediate: true, handler(setId) {
        let { currentId } = this
        this.log({ setId, currentId })
        if ( setId != currentId )
          this.setCurrent(setId)
      } })

    },


    watch: {

      caretPosition(caretPosition) {
        let { items, setId } = this
        if ( caretPosition + 1 ) {
          let counter = 0
          let total = sumBy(items, 'text.length')
          for ( let { text: { length } = '', id } of items ) {
            counter += length
            if ( counter > this.log(caretPosition) || counter == total) {
              if ( setId != id )
                this.$emit('pick', id)
              this.currentId = id
              break
            }
          }
        }
      }

    },

    methods: {

      process() {

        for ( let item of this.items ) {
          item.text=document.getElementById(this.idfy(item.id))?.innerText
        }

      },

      setCurrent(id) {
        let element = document.getElementById(this.idfy(id))
        if ( element ) {
          let { childNodes: [ node ] } = element
          if ( node ) {
            let range = document.createRange()
            let selection = window.getSelection()
            range.setStart(node, 0)

            selection.removeAllRanges()
            selection.addRange(range)
          }
        }
        this.currentId = id
      },

      getCaretPosition

    }

  }

</script>

<style>

</style>