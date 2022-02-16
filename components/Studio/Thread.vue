<template>
  <div class="d-inline">
    <template v-if="!node.isRoot">
      <template v-if="settings.navigation">
        <sub v-if="node.hasSiblings">
          <b-icon :id="'popover-'+node.id" size="sm" class="cursor-pointer mx-2"
            icon="list-nested"
            @click="showPopover = !showPopover"
            :variant="showPopover ? 'primary' : 'muted'"
          />
        </sub>
        <b-popover :show.sync="showPopover" ref="popover" delay=0 no-fade boundary="viewport" :target="'popover-'+node.id" 
          triggers="hover" 
          placement="bottom"
          :fallback-placement="['rightbottom', 'leftbottom']"
        >
          <b-button-close @click="showPopover=false"/>
          <div v-if="node.hasSiblings" style="overflow: hidden; overflow-x: auto; width: 200px">
            <TreeNode v-for="sibling in node.siblings" :key="sibling.id"
              v-bind="{ tree, node: sibling }"
            />
          </div>
        </b-popover>
      </template>
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
    </template>
    <transition-group name="node-span" tag="div" class="d-inline">
      <StudioThread v-if="node.hasChildren" :key="node.heir.id" v-bind="{
        node: node.heir,
        tree,
        settings
      }"/>
    </transition-group>
  </div>
</template>

<script>

  import { map } from 'lodash'

  export default {

    data() {
      return {
        showPopover: false
      }
    },

    props: ['tree', 'node', 'settings'],

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