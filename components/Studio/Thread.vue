<template>
  <div class="d-inline">
    <template v-if="!node.isRoot">
      <template v-if="settings.editing">
        <sub v-if="node.hasSiblings">
          <span :id="'popover-target-'+node.id" class="cursor-pointer ms-1 gray"
            v-text="parent.pinBranches ? '⊟' : '⊞'"
            @click="parent.toggle('pinBranches')"
            v-on="{
              ...parent.pinBranches && {
                mouseover: () => showPopover = true,
                mouseleave: () => showPopover = false
              }
            }"
          />
        </sub>
        <b-popover v-if="!parent.pinBranches" :show.sync="showPopover" ref="popover" delay=0 no-fade boundary="viewport" :target="'popover-target-'+node.id" 
          :triggers="parent.pinBranches ? 'manual' : 'hover'"
          placement="auto"
          :id="'popover-'+node.id"
          custom-class="m-0 p-0"
        >
          <div v-if="node.hasSiblings" style="overflow: hidden; overflow-x: auto; width: 200px" class="p-0">
            <TreeNode v-for="sibling in node.siblings" :key="sibling.id"
              v-bind="{ tree, node: sibling }"
            />
          </div>
        </b-popover>
        <transition name="slide-down">
          <div v-if="parent.pinBranches">
            <TreeNode v-for="sibling in node.siblings" :key="sibling.id"
              v-bind="{ tree, node: sibling, grayOutNonCurrent: true }"
            />
          </div>
        </transition>
      </template>
      <Editable v-if="!node.isRoot"
        :editable="settings.editing"
        tag="div"
        :class="{
          'blue': node == tree.node && settings.editing
        }"
        v-model="node.text"
        @click.native="$router.push({ hash: '#'+node.id })"
        @focus.native="$router.push({ hash: '#'+node.id })"
        @keydown.native.esc="settings.editing = false"
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

    computed: {

      parent() { return this.node.parent }
      
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

.blue {
  color: blue;
}

</style>