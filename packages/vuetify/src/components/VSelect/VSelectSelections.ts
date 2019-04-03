// Components
import VChipGroup from '../VChipGroup/VChipGroup'
import VChip from '../VChip/VChip'

// Types
import Vue, { VNode } from 'vue'

export default Vue.extend({
  name: 'v-select-selections',

  methods: {
    genChildren () {
      return [
        this.genChip()
      ]
    },
    genChip () {
      return this.$createElement(VChip, 'Chip')
    }
  },

  render (h): VNode {
    return h(VChipGroup, {

    }, this.genChildren())
  }
})
