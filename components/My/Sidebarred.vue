<template>
  <div>
    <NavPublic ref="nav" section="Tools" subsection="Builder" :target="{ name: 'ideas' }">
      <template #custom-nav>
        <slot name="nav"/>
      </template>
    </NavPublic>
    <b-container fluid>
      <b-modal size="lg" hide-footer v-model="isRoute({ hash: '#about' }).state">
        <h2 class="display-6">Turn your ideas into tangible assets</h2>
        <template #modal-title>
          Ideality&nbsp;<span class="fw-bold">Builder</span>
        </template>
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
              v-show="!$slots.content || expanded"
              :class="{
                shadow: narrow,
                'bg-white': true
              }"
              :style="narrow && { position: 'absolute' }"
            >
              <MyToolbar v-if="toolbars && toolbars.sidebar"
                v-bind="toolbars.sidebar"/>
              <b-row ref="sidebar" id="sidebar">
                <MyDiv :filler="expanded">
                  <slot name="sidebar" />
                </MyDiv>
              </b-row>  
            </b-col>
          </transition>
          <b-col v-if="$slots.content">
            <MyToolbar v-if="toolbars && toolbars.content"
              v-bind="toolbars.content"
            />
            <b-row id="content">
              <MyDiv :filler="!narrow || expanded">
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

  export default {

    props: ['expanded', 'toolbars'],

    watch: {
      narrow: { immediate: true, handler(narrow) {
        // console.log({narrow})
        this.$emit('setFields', { expanded: !narrow} )
      }}
    },

    computed: {


    }

  }

</script>

<style>

  #sidebar {
    background-color: white;
  }


</style>