<template>
  <Container>
    <div id="editor">
      <p>Hello World!</p>
      <p><span>Some</span><span> initial </span><strong>bold</strong> text</p>
      <p><br></p>
    </div>
    <b-button @click="enable">Enable quill</b-button>
  </Container>
</template>

<script>

  export default {

    head: {
      link: [
        { 
          rel: 'stylesheet',
          href: 'https://cdn.quilljs.com/1.3.6/quill.snow.css'
        }
      ],
      script: [
        {
          src: 'https://cdn.quilljs.com/1.3.6/quill.js'
        }
      ]
    },


    methods: {
      enable() {
        window.quill = new window.Quill('#editor', {
          theme: 'snow'
        })
      }
    }

  }

</script>

<style>

</style>