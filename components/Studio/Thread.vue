<template>
  <div class="d-inline">

    <template v-if="!node.isRoot">
      <Editable v-if="!node.isRoot"
        :editable="tree.editing"
        tag="div"
        :class="{
          'gray': node != tree.node && tree.editing
        }"
        v-model="node.text"
        @click.native="tree.editing = true; $router.push({ hash: '#'+node.id })"
        @focus.native="tree.editing = true; $router.push({ hash: '#'+node.id })"
        @keydown.native.esc="tree.editing = false"
        :id="'span-'+node.id"
        :ref="'span-'+node.id"
      />
      <div class="d-inline" :id="'anchor-'+node.id"/>
      <b-popover delay=0 no-fade boundary="viewport" :target="'span-'+node.id" triggers="focus" placement="bottom">
        Hello
        <div v-if="node.hasSiblings" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; width: 200px">
          <TreeNode v-for="sibling in node.sortedSiblings" :key="sibling.id"
            v-bind="{ tree, node: sibling }"
          />
        </div>
      </b-popover>
    </template>
    <template v-if="maybe(node.heir).hasSiblings">
      <sub>
        <nuxt-link class="gray"
          tabindex="-1"
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

  import { map } from 'lodash'

  export default {

    props: ['tree', 'node'],

    data() {
      return {
        popoverOpen: true
      }
    },

    methods: {
      map
    }

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