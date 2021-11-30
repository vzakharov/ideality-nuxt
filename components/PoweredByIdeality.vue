<template>
  <div class="text-end pt-2">
    <small>
      <a style="color:#BBB" :href="'https://ideality.app/' + (target || '')" target="_blank">
        Powered by ▲ Ideality
      </a>
      <slot/>
    </small>
  </div>
</template>

<script>

  export default {
    props: ['target']
  }

</script>
