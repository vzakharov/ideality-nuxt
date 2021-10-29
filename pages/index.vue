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
          <img src="/image.svg" :style="{
              width: '300px', 
              animation: rotate && `rotation ${rotate_period}s infinite linear`
            }" 
            @click="rotate=true; rotate_period -= 2"
          />
        </b-col>
      </b-row>
      <b-row align-h="center" align-v="center" class="vh bg-light">
        <b-row class="h-75">
          <b-row align-h="center">
            <b-col align-self="center">
              <h2 class="text-center fw-normal display-5">Products</h2>
            </b-col>
          </b-row>
          <b-row align-h="center">
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
              }]" :key="i" xs="12" md="3" sm="4" class="text-center mb-4"
            >
              <h3 class="display-6">Ideality {{ item.title }}</h3>
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
                <b-button variant="primary" size="lg"
                  @click="show.accessRequest=true; $nextTick(() => window.document.getElementById('access-request-email').focus())"
                >
                  Request access
                </b-button>
              </div>
              <AccessRequest class="shadow rounded-3 p-3" v-if="show.accessRequest" :value="{section: 'homepage'}"/>
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
      rotate: false,
      rotate_period: 60,
      show: {
        accessRequest: false
      }
    }}
  }

</script>

<style>

  .vh {
    height: 100vh;
  }

  .bg-retro {
    background-color: #FBF7EC
  }

  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(359deg);
    }
  }

  .text-responsive {
    font-size: calc(70% + 1vw);
  }

</style>