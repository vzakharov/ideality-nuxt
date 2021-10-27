<template>
  <div>
    <b-container fluid>
      <b-row align-h="center" class="vh bg-retro gx-4">
        <b-col cols="12" md="5" align-self="center">
          <h1 class="display-2"><strong>Ideality&nbsp;🔺</strong></h1>
          <div class="display-6"><small>AI&#8209;driven&nbsp;ideation&nbsp;platform</small></div>
          <p class="lead py-3" >
            Ideality is a set of AI-driven ideation tools built to make ideas come to life. 
            Whether it’s about yourself or your users and customers, Ideality helps explore, 
            refine and flesh out that will one day change the world.
          </p>
        </b-col>
        <b-col cols="3" align-self="center" class="d-none d-md-block">
          <img src="/image.svg" style="transform:rotate(180deg); width: 300px"/>
        </b-col>
      </b-row>
      <b-row align-h="center" class="vh">
        <b-col cols="4" align-self="center">
          <h2 class="text-center display-4">Products</h2>
        </b-col>
        <b-row align-h="center" class="gx-4">
          <b-col v-for="(item, i) in [
            { 
              title: 'Widget', 
              description: 'Install a widget on your site that will give your users ideas on how to use your product.',
              url: 'widget'
            },
            { 
              title: 'Chat', 
              description: 'The first multi-user AI chatbot that helps people brainstorm & develop ideas together.'
            },
            { 
              title: 'Studio', 
              description: 'An AI-enabled text editor with tree-like structure so that you don’t miss a single idea.'
            }]" :key="i" xs="12" md="3" sm="4" class="text-center">
            <h3 class="display-6">Ideality {{ item.title }}</h3>
            <p class="lead">
              {{ item.description }}
            </p>
            <b-button v-if="item.url" class="mx-auto" variant="outline-primary" :to="item.url">
              Learn more
            </b-button>
            <em v-else>Coming soon!</em>
          </b-col>
        </b-row>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {

}
</script>

<style>

  .vh {
    height: 100vh;
  }

  .bg-retro {
    background-color: #FBF7EC
  }

</style>