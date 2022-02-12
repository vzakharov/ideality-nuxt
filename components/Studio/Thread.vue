<template>
  <div class="d-inline">

    <Editable v-if="!node.isRoot"
      :editable="tree.focused"
      tag="div"
      :class="{
        'gray': node != tree.node && tree.focused
      }"
      v-model="node.text"
      @click.native="tree.focused = true; $router.push({ hash: '#'+node.id })"
      @focus.native="tree.focused = true; $router.push({ hash: '#'+node.id })"
      @keydown.native.esc="tree.focused = false"
      :id="'span-'+node.id"
      :ref="'span-'+node.id"
    />
    <template v-if="node.heir && node.heir.hasSiblings">
      <sub>
        <nuxt-link class="gray"
          :to="{ hash: '#'+node.heir.nextSibling.id }"
          v-text="node.heir.placeAmongSiblings"
        />
      </sub>
    </template>
    <transition-group name="node-span" tag="div" class="d-inline">
      <StudioThread v-if="node.hasChildren" :key="node.heir.id" v-bind="{
        node: node.heir,
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

.node-span-enter-active, .node-span-leave-active {
  /* transition: var(--animation-speed); */
  transition: .5s;
}

.node-span-leave-to {
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100px;
  position: absolute;
  height: 30px;
  opacity: 0;
  transform: translateY(-100%);
}

.node-span-enter {
  opacity: 0;
  position: absolute;
  transform: translateY(100%);
}

</style>