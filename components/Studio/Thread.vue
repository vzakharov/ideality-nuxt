<template>
  <div class="d-inline">
    <Editable v-if="!node.isRoot"
      tag="div"
      :class="{
        'node-span': true,
        'fw-bold': node == tree.node && tree.focused
      }"
      v-model="node.text"
      @focus.native="$router.push({ hash: '#'+node.id }); tree.focused = true"
      @blur.native="tree.focused = false"
      :id="'span-'+node.id"
      :ref="'span-'+node.id"
    />
    <transition-group name="node-span">
      <StudioThread v-if="node.hasChildren" :key="node.children[0].id" v-bind="{
        node: node.children[0],
        tree
      }"/>
    </transition-group>
  </div>
</template>

<script>

  export default {

    props: ['tree', 'node']

  }

</script>

<style>

.node-span {
  display: inline;
  outline: none;
}

.node-span-enter-active, .node-span-leave-active {
  transition: var(--animation-speed);
}

.node-span-leave-to {
  opacity: 0;
  position: absolute;
  transform: translateY(-100%);
}

.node-span-enter {
  opacity: 0;
  position: absolute;
  transform: translateY(100%);
}

</style>