// Styles
import './VSelectNew.sass'

// Extensions
import VTextField from '../VTextField/VTextField'

// Components
import VInput from '../VInput/VInput'
import VMenu from '../VMenu/VMenu'
import VSelectGroup from './VSelectGroup'
import VSelectSelections from './VSelectSelections'
import { PropValidator } from 'vue/types/options'

export const defaultMenuProps = {
  eager: true,
  maxHeight: 300
}

export default VTextField.extend({
  name: 'v-select-new',

  props: {
    checkboxes: Boolean,
    items: {
      type: Array,
      default: () => ([])
    } as PropValidator<any[]>,
    menuProps: {
      type: [String, Array, Object],
      default: () => defaultMenuProps
    },
    mandatory: Boolean,
    multiple: Boolean
  },

  computed: {
    __cachedMenuProps (): any {
      let normalisedProps: any

      normalisedProps = typeof this.menuProps === 'string'
        ? this.menuProps.split(',')
        : this.menuProps

      if (Array.isArray(normalisedProps)) {
        normalisedProps = normalisedProps.reduce((acc, p) => {
          acc[p.trim()] = true
          return acc
        }, {})
      }

      return {
        ...defaultMenuProps,
        nudgeBottom: normalisedProps.offsetY ? 1 : 0, // convert to int
        ...normalisedProps
      }
    },
    classes (): object {
      return {
        ...VTextField.options.computed.classes.call(this),
        'v-select-new': true
      }
    },
    groupItems (): any[] {
      return this.items
    }
  },

  methods: {
    genInput () {
      const input = VTextField.options.methods.genInput.call(this)

      input.data!.domProps!.value = null
      input.data!.attrs!.readonly = true
      input.data!.attrs!['aria-readonly'] = String(this.readonly)

      return input
    },
    genListItemGroup () {
      return this.$createElement(VSelectGroup, {
        props: {
          checkboxes: this.checkboxes,
          items: this.groupItems,
          multiple: this.multiple
        },
        on: {
          change: (val: any) => {
            this.internalValue = val
          }
        }
      })
    },
    genMenu () {
      const props = this.__cachedMenuProps
      props.activator = this.$refs.wrapper
      props.closeOnContentClick = !this.multiple

      // Attach to root el so that
      // menu covers prepend/append icons
      if (
        // TODO: make this a computed property or helper or something
        props.attach === '' || // If used as a boolean prop (<v-menu attach>)
        props.attach === true || // If bound to a boolean (<v-menu :attach="true">)
        props.attach === 'attach' // If bound as boolean prop in pug (v-menu(attach))
      ) {
        props.attach = this.$el
      }

      return this.$createElement(VMenu, {
        props,
        ref: 'menu'
      }, [this.genListItemGroup()])
    },
    genListSelectionGroup () {
      return this.$createElement(VSelectSelections)
    },
    genWrapper () {
      const render = VInput.options.methods.genWrapper.call(this)

      render.children!.push(this.genMenu())

      return render
    }
  }
})
