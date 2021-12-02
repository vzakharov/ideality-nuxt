<template>
  <div>
      <ObjectConfig :value="widget"
        indirect v-on="$listeners"
        :fields="{
          name: {}
        }"
      />
      <ObjectConfig v-model="display" :fields="{
        description: { caption: 'Description', placeholder: 'The text that will show up in the widget', multiline: true},
        sampleDescription: { hide: !widget.isExample, caption: 'Description (for owners)', multiline: true},
        inputCaption: { caption: 'Caption for user input', placeholder: 'e.g. “Tell us about yourself”'},
        inputPlaceholder: { caption: 'Placeholder for user input', placeholder: 'e.g. “I am a ...”', multiline: true },
        suggestCaption: { caption: 'What to write instead of “Suggest” (optional)', placeholder: 'e.g. “Generate”, “Go”, etc.'},
        outputCaption: { caption: 'Caption for AI output', placeholder: 'e.g. “Here’s what our product can do for you”'},
        preCTA: { caption: 'Line before CTA button', placeholder: 'e.g. “Intrigued?”' },
        CTA: { caption: 'Text on the CTA button', placeholder: 'Text on the CTA button' },
        postCTA: {caption: 'Line after the CTA button', placeholder: 'Shown in grey fine print under the button'},
        CTAContent: { caption: 'Link to send to', placeholder: 'Use <input> and <output> to refer to the input and output, respectively.', multiline: true }
      }"/>
  </div>
</template>

<script>

  export default {

    props: ['value', 'context'],

    data() {
      let display = this.setDefaults(this.value, {
        name: '',
        description: '',
        sampleDescription: '',
        inputCaption: '',
        inputPlaceholder: '',
        outputCaption: '',
        preCTA: '',
        CTA: '',
        postCTA: '',
        CTAType: 'link',
        CTAEmail: '',
        CTAContent: ''
      })
      let { widget } = this.context
      // debugger
      return { display, widget }
    }

  }

</script>

<style>

</style>