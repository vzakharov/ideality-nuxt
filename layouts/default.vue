<template>
  <div>
    <style>
      :root {
        --full-minus-header: calc(100vh - {{ store.headerHeight }}px)
      }
    </style>
    <Nuxt/>
  </div>
</template>

<script>

  import { loggedInMiddleware } from '~/plugins/helpers'

  export default {

    async middleware({ route: { query } }) {
      if ( typeof query.admin !== 'undefined' )
        return loggedInMiddleware(...arguments)
    },

    mounted() {
      let setWidth = () => {
        this.$store.commit('set', { width: window.innerWidth })
      }

      setWidth()
      window.onresize = () => {
        setWidth()
      }  
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
  height: var(--full-minus-header);
  overflow: hidden;
  overflow-y: auto;
}

.vh {
  height: var(--full-minus-header)
}

.slide-right-enter-active, .slide-right-leave-active, .slide-down-enter-active, .slide-down-leave-active {
  transition: .5s;
}

.slide-right-enter, .slide-right-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translate(-100%, 0);
}

.slide-down-enter, .slide-down-leave-to {
  transform: translate(100%, 0)
}

</style>