<template>
  <div>
    <NavPublic ref="nav" v-bind="{ ...nav, subsection: about.title }">
      <template #custom-nav>
        <slot name="nav"/>
      </template>
    </NavPublic>
    <b-container fluid>
      <b-modal size="lg" hide-footer v-model="isRoute({ hash: '#about' }).state">
        <h2 class="display-6" v-text="about.tagline"/>
        <template #modal-title>
          Ideality&nbsp;<span class="fw-bold" v-text="about.title"/>
        </template>
        <p v-text="about.description || loremIpsum"/>
      </b-modal>
      <Loading v-if="!$slots.content && !$slots.sidebar" message="Loading, hold on a sec..."/>
      <template v-else>
        <b-row ref="container">
          <transition :name="narrow && $slots.content ? 'slide-right' : ''">
            <b-col
              v-bind="{...$slots.content && {
                cols: 9,
                sm: 7,
                md: 3
              }}"
              v-show="!$slots.content || sidebar.expanded"
              :class="{
                shadow: narrow,
                'bg-white': true
              }"
              :style="narrow && { position: 'absolute' }"
            >
              <MyToolbar
                v-bind="deepMerge(
                  { items:  [
                    { if: !!$slots.content, icon: 'chevron-double-left', onclick() { sidebar.expanded = false } },
                  ] },
                  toolbars.sidebar || {}
                )
              "/>
              <b-row ref="sidebar" id="sidebar">
                <MyDiv :filler="sidebar.expanded">
                  <slot name="sidebar" />
                </MyDiv>
              </b-row>  
            </b-col>
          </transition>
          <b-col v-if="$slots.content">
            <MyToolbar
              v-bind="deepMerge(
                {         
                  close: { to: nav.target },
                  items: [
                    { if: !sidebar.expanded, icon: 'chevron-double-right', onclick() { sidebar.expanded = true } },
                  ]
                },
                toolbars.content || {}
              )"
            />
            <b-row id="content">
              <MyDiv :filler="!narrow || sidebar.expanded">
                <slot name="content" />
              </MyDiv>
            </b-row>  
          </b-col>
        </b-row>
      </template>
    </b-container>
  </div>
</template>

<script>

  import { deepMerge, objectify } from '~/plugins/helpers.js'

  export default {

    props: { ...objectify(['nav', 'about', 'sidebar']),
      toolbars: {
        default: {}
      }
    },

    watch: {
      narrow: { immediate: true, handler(narrow) {
        this.sidebar.expanded = !narrow
      }}
    },

    methods: {
      deepMerge
    }

  }

</script>

<style>

  #sidebar {
    background-color: white;
  }


</style>