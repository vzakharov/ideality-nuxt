<template>
  <FullBox>
    <h3 class="display-6">
      My shopping list
    </h3>
    <p>
      (for {{ meal }})
    </p>
    <div class="my-3">
      <MyInput class="lead" v-for="item in items" :key="item" type="boolean" :caption="item"/>
    </div>
    <p class="text-muted">
      (This is a sample page to illustrate what the widget can do.)
    </p>
  </FullBox>
</template>

<script>

export default {

  data() {
    return {
      items: this.$route.query.items.split('•').map(s=>s.trim()).filter(s=>s),
      meal: this.$route.query.meal
    }
  }

}

</script>