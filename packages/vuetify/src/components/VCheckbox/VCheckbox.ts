// Styles
import '../../styles/components/_selection-controls.sass'

// Components
import VIcon from '../VIcon'
import VInput from '../VInput'

// Mixins
import Selectable from '../../mixins/selectable'

/* @vue/component */
export default Selectable.extend({
  name: 'v-checkbox',

  props: {
    indeterminate: Boolean,
    indeterminateIcon: {
      type: String,
      default: '$vuetify.icons.checkboxIndeterminate'
    },
    onIcon: {
      type: String,
      default: '$vuetify.icons.checkboxOn'
    },
    offIcon: {
      type: String,
      default: '$vuetify.icons.checkboxOff'
    }
  },

  data () {
    return {
      inputIndeterminate: this.indeterminate
    }
  },

  computed: {
    classes (): object {
      return {
        'v-input--selection-controls': true,
        'v-input--checkbox': true
      }
    },
    computedIcon (): string {
      if (this.inputIndeterminate) {
        return this.indeterminateIcon
      } else if (this.isActive) {
        return this.onIcon
      } else {
        return this.offIcon
      }
    }
  },

  watch: {
    indeterminate (val) {
      this.inputIndeterminate = val
    }
  },

  methods: {
    genInputSlot () {
      const render = VInput.options.methods.genInputSlot.call(this)
      const ripple = this.genRipple(this.setTextColor(this.computedColor))
      const icon = this.$createElement(VIcon, this.setTextColor(this.computedColor, {
        props: {
          dark: this.dark,
          light: this.light
        }
      }), this.computedIcon)
      const children = render.children!
      const input = children.splice(1, 1)

      render.children! = [
        icon,
        ...input,
        ...children,
        ripple
      ]

      return render
    },
    genInput () {
      const render = Selectable.options.methods.genInput.call(
        this,
        'checkbox',
        {}
      )

      render.data!.attrs!['aria-checked'] = this.inputIndeterminate
        ? 'mixed'
        : this.isActive.toString()
    }
  }
})
