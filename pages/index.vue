<template>
  <div>
    <NavPublic/>
    <b-container fluid>
      <b-row align-h="center" class="vh-minus-navs bg-retro gx-4">
          <b-col cols="12" md="5" align-self="center" class="text-center text-md-start">
            <h1 class="display-2"><strong>Ideality&nbsp;🔺</strong></h1>
            <div class="display-6"><small>AI&#8209;driven&nbsp;ideation&nbsp;platform</small></div>
            <BigLogo class="d-md-none"/>
            <p class="lead py-3" >
              Ideality is a set of AI-driven tools built to make ideas come to life. 
              Ideality helps explore, refine and flesh out ideas that will one day change the world.
            </p>
          </b-col>
          <b-col cols="3" align-self="center" class="d-none d-md-block">
            <BigLogo/>
          </b-col>
      </b-row>
      <b-row align-h="center" align-v="center" class="vh bg-light">
        <b-row class="h-75">
          <b-row align-h="center">
            <b-col align-self="center">
              <h2 id="products" class="text-center fw-normal display-5">Products</h2>
            </b-col>
          </b-row>
          <b-row align-h="center">
            <b-col v-for="(item, i) in [
              { 
                id: 'widget',
                title: 'Widget', 
                description: 'Install a widget on your site that will give your users ideas on how to use your product.',
                url: 'widget'
              },
              { 
                id: 'chat',
                title: 'Chat', 
                description: 'The first multi-user AI chatbot that helps people brainstorm & develop ideas together.'
              },
              { 
                id: 'studio',
                title: 'Studio', 
                description: 'An AI-enabled text editor with tree-like structure so that you don’t miss a single idea.'
              }]" :key="i" xs="12" md="3" sm="4" class="text-center mb-4"
              :class="{shadow: route.hash=='#'+item.id}"
            >
              <h3 :id="item.id" class="display-6">Ideality {{ item.title }}</h3>
              <p class="lead text-responsive">
                {{ item.description }}
              </p>
              <b-button v-if="item.url" class="mx-auto" variant="outline-primary" :to="item.url">
                Learn more
              </b-button>
              <em v-else>Coming soon!</em>
            </b-col>
          </b-row>
          <b-row align-h="center" class="margin-bottom:400px">
            <b-col align-self="center">
              <div v-if="!show.accessRequest" class="text-center">
                <p class="lead">
                  ...and more to come!
                </p>
                <b-button size="lg" to="request-access" variant="primary">
                  Request access
                </b-button>
              </div>
            </b-col>
          </b-row>
        </b-row>
      </b-row>
    </b-container>
  </div>
</template>

<script>

  export default {
    data() { return {
      show: {
        accessRequest: false
      }
    }}
  }

</script>

<style>

  .bg-retro {
    background-color: #FBF7EC
  }


  .text-responsive {
    font-size: calc(70% + 1vw);
  }

</style>