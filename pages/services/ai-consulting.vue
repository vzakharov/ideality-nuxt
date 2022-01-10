<template>
  <div>
    <NavHomepage/>
    <Container hide-breadcrumbs style="max-width:960px">
      <b-row align-h="center" class="px-0 px-md-5">
        <h1 class="display-6 fw-bold mb-4">
          Make AI language models work for you
        </h1>
        <div style="font-size:1.2em">
          <p>With all the <span class="fw-bold">noise around GPT-3</span> and similar models, it’s easy to lose sight of the fact that GPT-3 is just a tool. And, like any tool, it only works if it’s used properly.</p>
          <p>While building Ideality, we’ve gained a lot of language model expertise, which we now want to share by helping you <span class="fw-bold">solve your business problems using language AI</span>.</p>
          <p>Our AI consulting service will help you:</p>
          <ul>
          <li><span class="fw-bold">Understand how language models work,</span></li>
          <li><span class="fw-bold">Find the right use case</span> for your business, and</li>
          <li><span class="fw-bold">Build a prototype</span> you can start using right away.</li>
          </ul>
        </div>
        <div>
          <p class="lead">
            <big><span class="fw-bold">Don’t get left behind</span>.<br/>Learn how to make language AI work for you today.</big>
          </p>
          <b-alert :show="sent" variant="success">
            We received your request and will get back to you at <strong>{{ email }}</strong> in 24 hours!
          </b-alert>
          <b-button :variant="sent ? 'outline-secondary' : 'primary'" :size="!sent && 'lg'" @click="hash('request').set()"
            v-text="sent ? 'Send another request' : 'Order now for $300'"
          />
        </div>
        <div class="mt-1 text-muted small">
          <p>You will <strong>NOT</strong> be charged right away.</p>
          <p class="mb-1">Scope of work:</p>
          <ul>
            <li>Preliminary analysis according to your input data</li>
            <li>One-hour consultancy call at an agreed date &amp; time.</li>
            <li>Prototype delivery within 5 (five) business days after the call.</li>
          </ul>
        </div>
      </b-row>
      <b-modal centered hide-header hide-footer v-model="hash('request').state">
        <div>
          <p>Thank you for your interest!</p>
          <p>Please describe your company, product or use case (if you know one already) below.</p>
        </div>
        <b-form>
          <ObjectConfig v-model="vm"
            :fields="{
              email: { placeholder: 'gbr@openai.com'},
              description: { placeholder: 'We are ….. We’re building an app for …. We want to …. Here are some links: …', multiline: true, description: 'Be as detailed as possible. The more we know, the more we can help you.' }
            }"
          />
          <b-button :disabled="!email || !description" type="submit" size="lg" variant="primary" class="mb-2"
            @click.prevent="bubble.go('sendConsultingRequest', {email, description}).then(() => { sent=true; hash('request').clear()}).catch(()=>window.alert('Something went wrong. Please contact me at vzakharov@gmail.com. ~Vova'))"
          >
            Send request
          </b-button>
          <p>
            If, according to our preliminary analysis, we believe we can help you, we will reach out to you within 24 hours with a link for payment and a Calendly link for scheduling a call.
          </p>
        </b-form>
      </b-modal>
    </Container>
  </div>
  
</template>

<script>

  export default {

    head() { return {
      title: `Ideality Consulting 🔺 Make AI language models work for you`
    }},

    data() { return {
      email: '',
      description: '',
      sent: false
    }}
  }

</script>

<style>

</style>