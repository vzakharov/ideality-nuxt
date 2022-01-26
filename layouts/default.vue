<template>
  <div>
    <style>
      :root {
        --vh-minus-navs: calc(100vh - {{ store.navHeight }}px)
      }
    </style>
    <Nuxt/>
  </div>
</template>

<script>

  import { loggedInMiddleware } from '~/plugins/helpers'
  import { sumBy } from 'lodash'

  export default {

    async middleware({ route: { query } }) {
      if ( typeof query.admin !== 'undefined' )
        return loggedInMiddleware(...arguments)
    },

    mounted() {
      let setWidth = () => {
        this.store.width = window.innerWidth
      }

      setWidth()
      window.onresize = () => {
        setWidth()
      }  
    },

    watch: {
      'store.width'(width) {
        let narrow = width < 768
        if ( narrow != this.store.narrow )
          this.store.narrow = narrow
      }
    },

    methods: {
      sumBy
    }

  }

</script>


<style>
.close {
  float: right;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  opacity: 0.5;
}
.close:hover {
  color: #000;
  text-decoration: none;
}
.close:not(:disabled):not(.disabled):focus,
.close:not(:disabled):not(.disabled):hover {
  opacity: 0.75;
}
button.close {
  padding: 0;
  background-color: transparent;
  border: 0;
}
a.close.disabled {
  pointer-events: none;
}

a {
  text-decoration: none;
}

a.nocolor {
  color: inherit;
}

.translucent {
  opacity: 30%
}

.bg-retro {
  background-color: #fbf7ec;
}

.gray {
  color: #bbb;
}

.grayscale {
  -webkit-filter: grayscale(100%);
  filter: grayscale(100%);
}

.small {
  font-size: 0.75em;
}

.mw-800 {
  max-width: 800px;
}

.scrollable {
  height: var(--vh-minus-navs);
  overflow: hidden;
  overflow-y: auto;
}

.vh-minus-navs {
  height: var(--vh-minus-navs)
}

.vh {
  height: 100vh
}

.slide-right-enter-active, .slide-right-leave-active, .slide-down-enter-active, .slide-down-leave-active {
  transition: .5s
}

.slide-right-enter, .slide-right-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateX(-100%);
  opacity: 0
}

.slide-down-enter, .slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0
}

</style>