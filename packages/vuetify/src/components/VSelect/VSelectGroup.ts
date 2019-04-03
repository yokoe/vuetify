// Components
import VDivider from '../VDivider/VDivider'
import VSubheader from '../VSubheader/VSubheader'
import {
  VList,
  VListItem,
  VListItemAction,
  VListItemContent,
  VListItemGroup,
  VListItemTitle
} from '../VList'

// Mixins
import Proxyable from '../../mixins/proxyable'

// Utilities
import {
  escapeHTML,
  getPropertyFromItem,
  getSlot
} from '../../util/helpers'
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue'
import { PropValidator } from 'vue/types/options'

const baseMixins = mixins(
  VList,
  Proxyable
)

interface options extends InstanceType<typeof baseMixins> {
  $refs: {
    group: InstanceType<typeof VListItemGroup>
  }
}

type ItemAttribute = string | (string | number)[] | ((item: object, fallback?: any) => any)

export default baseMixins.extend<options>().extend({
  name: 'v-select-group',

  props: {
    hideSelected: Boolean,
    items: {
      type: Array,
      default: () => ([])
    } as PropValidator<any[]>,
    itemAvatar: {
      type: [String, Array, Function],
      default: 'avatar'
    } as PropValidator<ItemAttribute>,
    itemDisabled: {
      type: [String, Array, Function],
      default: 'disabled'
    } as PropValidator<ItemAttribute>,
    itemText: {
      type: [String, Array, Function],
      default: 'text'
    } as PropValidator<ItemAttribute>,
    itemValue: {
      type: [String, Array, Function],
      default: 'value'
    } as PropValidator<ItemAttribute>,
    mandatory: Boolean,
    noFilter: Boolean,
    search: String
  },

  computed: {
    localeSearch (): string {
      return (this.search || '').toString().toLocaleLowerCase()
    }
  },

  methods: {
    genAppendItem () {
      return getSlot(this, 'append') || []
    },
    genChildren () {
      return [
        ...this.genPrependItem(),
        this.genListItemGroup(),
        ...this.genAppendItem()
      ]
    },
    genDivider () {
      return getSlot(this, 'divider') ||
        this.$createElement(VDivider)
    },
    genFilteredText (text: string) {
      text = text || ''

      if (!this.search || this.noFilter) return escapeHTML(text)

      const { start, middle, end } = this.getMaskedCharacters(text)

      return `${escapeHTML(start)}${this.genHighlight(middle)}${escapeHTML(end)}`
    },
    genHeader (item: any) {
      return getSlot(this, 'header') ||
        this.$createElement(VSubheader, item.header)
    },
    genHighlight (text: string): string {
      return `<span class="v-select-group__text-mask">${escapeHTML(text)}</span>`
    },
    genItems () {
      const items: any[] = []

      for (const item of this.items) {
        if (
          (this.search && !this.itemIsBeingFiltered(item)) ||
          (this.hideSelected && this.itemIsSelected(item))
        ) continue

        if (item.header) items.push(this.genHeader(item))
        else if (item.divider) items.push(this.genDivider())
        else items.push(this.genListItem(item))
      }

      return items
    },
    genListItem (item: any) {
      return this.$createElement(
        VListItem,
        this.getListItemData(item),
        [this.genListItemContent(item)]
      )
    },
    genListItemContent (item: any): VNode {
      const innerHTML = this.genFilteredText(this.getText(item))

      return this.$createElement(VListItemContent,
        [this.$createElement(VListItemTitle, {
          domProps: { innerHTML }
        })]
      )
    },
    genListItemGroup () {
      return this.$createElement(VListItemGroup, {
        props: {
          mandatory: this.mandatory || this.internalValue != null,
          value: this.internalValue
        },
        on: {
          change: (val: any) => {
            this.internalValue = val
          }
        },
        ref: 'group'
      }, this.genItems())
    },
    genPrependItem () {
      return getSlot(this, 'prepend') || []
    },
    getAvatar (item: object) {
      return Boolean(getPropertyFromItem(item, this.itemAvatar, false))
    },
    getListItemData (item: any) {
      return {
        props: {
          disabled: this.getDisabled(item),
          value: this.getValue(item)
        }
      }
    },
    getMaskedCharacters (text: string): {
      start: string
      middle: string
      end: string
    } {
      const search = this.localeSearch
      const index = text.toLocaleLowerCase().indexOf(search)

      if (index < 0) return { start: text, middle: '', end: '' }

      const start = text.slice(0, index)
      const middle = text.slice(index, index + search.length)
      const end = text.slice(index + search.length)
      return { start, middle, end }
    },
    getDisabled (item: object) {
      return Boolean(getPropertyFromItem(item, this.itemDisabled, false))
    },
    getText (item: object) {
      return String(getPropertyFromItem(item, this.itemText, item))
    },
    getValue (item: object) {
      return getPropertyFromItem(item, this.itemValue, this.getText(item))
    },
    itemIsBeingFiltered (item: any) {
      return this.getText(item).toLowerCase().indexOf(this.localeSearch) > -1
    },
    itemIsSelected (item: any) {
      return this.$refs.group.selectedValues.includes(
        this.getValue(item)
      )
    }
  },

  render (h): VNode {
    const render = VList.options.render.call(this, h)

    render.children! = this.genChildren()

    return render
  }
})
