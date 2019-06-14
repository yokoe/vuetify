// Styles
import './VInput.sass'

// Components
import VIcon from '../VIcon'
import VLabel from '../VLabel'
import VMessages from '../VMessages'

// Mixins
import Colorable from '../../mixins/colorable'
import Themeable from '../../mixins/themeable'

// Utilities
import {
  convertToUnit,
  kebabCase,
} from '../../util/helpers'

// Types
import { VNode, VNodeData } from 'vue'
import mixins from '../../util/mixins'
import { PropValidator } from 'vue/types/options'

const baseMixins = mixins(
  Colorable,
  Themeable,
)

interface options extends InstanceType<typeof baseMixins> {
  /* eslint-disable-next-line camelcase */
  $_modelEvent: string
}

/* @vue/component */
export default baseMixins.extend<options>().extend({
  name: 'v-input',

  props: {
    appendIcon: String,
    backgroundColor: {
      type: String,
      default: '',
    },
    height: [Number, String],
    hideDetails: Boolean,
    hint: String,
    id: String,
    label: String,
    loading: Boolean,
    persistentHint: Boolean,
    prependIcon: String,
    state: {
      type: String,
      validator: (v: string) => !v || ['success', 'error'].includes(v),
    } as PropValidator<'success' | 'error' | null>,
    messages: {
      type: Array,
      default: () => ([]),
    } as PropValidator<string[]>,
    disabled: Boolean,
    readonly: Boolean,
    dirty: Boolean,
    showFocus: Boolean,
    absoluteLabel: Boolean,
    hasPlaceholder: Boolean,
  },

  data () {
    return {
      attrsInput: {},
      hasFocus: false,
      hasMouseDown: false,
    }
  },

  computed: {
    hasMessages (): boolean {
      return !!this.messages.length
    },
    classes (): object {
      return {
        'v-input--has-state': this.hasMessages,
        'v-input--hide-details': this.hideDetails,
        'v-input--is-label-active': this.isLabelActive,
        'v-input--is-dirty': this.dirty,
        'v-input--is-disabled': this.disabled,
        'v-input--is-focused': this.hasFocus,
        'v-input--is-loading': this.loading !== false && this.loading !== undefined,
        'v-input--is-readonly': this.readonly,
        'v-input--show-focus': this.showFocus,
        ...this.themeClasses,
      }
    },
    hasHint (): boolean {
      return !this.hasMessages &&
        !!this.hint &&
        (this.persistentHint || this.hasFocus)
    },
    hasLabel (): boolean {
      return !!(this.$slots.label || this.label)
    },
    isDisabled (): boolean {
      return this.disabled || this.readonly
    },
    isLabelActive (): boolean {
      return this.dirty
    },
    computedColor (): string | undefined {
      if (this.state) return this.state
      else if (this.hasFocus && this.color) return this.color
      return undefined
    },
  },

  methods: {
    genContent () {
      return [
        this.genPrependSlot(),
        this.genControl(),
        this.genAppendSlot(),
      ]
    },
    genControl () {
      return this.$createElement('div', {
        staticClass: 'v-input__control',
      }, [
        this.genInputSlot(),
        this.genMessages(),
      ])
    },
    genDefaultSlot () {
      return [
        this.genLabel(),
        this.$slots.default,
      ]
    },
    genIcon (
      type: string,
      cb?: (e: Event) => void
    ) {
      const icon = (this as any)[`${type}Icon`]
      const eventName = `click:${kebabCase(type)}`

      const data: VNodeData = {
        props: {
          color: this.computedColor,
          dark: this.dark,
          disabled: this.disabled,
          light: this.light,
        },
        on: !(this.$listeners[eventName] || cb)
          ? undefined
          : {
            click: (e: Event) => {
              e.preventDefault()
              e.stopPropagation()

              this.$emit(eventName, e)
              cb && cb(e)
            },
            // Container has g event that will
            // trigger menu open if enclosed
            mouseup: (e: Event) => {
              e.preventDefault()
              e.stopPropagation()
            },
          },
      }

      return this.$createElement('div', {
        staticClass: `v-input__icon v-input__icon--${kebabCase(type)}`,
        key: type + icon,
      }, [
        this.$createElement(
          VIcon,
          data,
          icon
        ),
      ])
    },
    genInputSlot () {
      return this.$createElement('div', this.setBackgroundColor(this.backgroundColor, {
        staticClass: 'v-input__slot',
        style: { height: convertToUnit(this.height) },
        on: {
          click: this.onClick,
          mousedown: this.onMouseDown,
          mouseup: this.onMouseUp,
        },
        ref: 'input-slot',
      }), [this.genDefaultSlot()])
    },
    genLabel () {
      if (!this.hasLabel) return null

      return this.$createElement(VLabel, {
        props: {
          absolute: this.absoluteLabel,
          value: this.hasFocus || this.hasPlaceholder,
          color: this.computedColor,
          dark: this.dark,
          focused: this.hasMessages,
          for: this.id,
          light: this.light,
        },
      }, this.$slots.label || this.label)
    },
    genMessages () {
      if (this.hideDetails) return null

      const messages = this.hasHint
        ? [this.hint]
        : this.messages

      return this.$createElement(VMessages, {
        props: {
          color: this.hasHint ? '' : this.computedColor,
          dark: this.dark,
          light: this.light,
          value: (this.hasMessages || this.hasHint) ? messages : [],
        },
      })
    },
    genSlot (
      type: string,
      location: string,
      slot: (VNode | VNode[])[]
    ) {
      if (!slot.length) return null

      const ref = `${type}-${location}`

      return this.$createElement('div', {
        staticClass: `v-input__${ref}`,
        ref,
      }, slot)
    },
    genPrependSlot () {
      const slot = []

      if (this.$slots.prepend) {
        slot.push(this.$slots.prepend)
      } else if (this.prependIcon) {
        slot.push(this.genIcon('prepend'))
      }

      return this.genSlot('prepend', 'outer', slot)
    },
    genAppendSlot () {
      const slot = []

      // Append icon for text field was really
      // an appended inner icon, v-text-field
      // will overwrite this method in order to obtain
      // backwards compat
      if (this.$slots.append) {
        slot.push(this.$slots.append)
      } else if (this.appendIcon) {
        slot.push(this.genIcon('append'))
      }

      return this.genSlot('append', 'outer', slot)
    },
    onClick (e: Event) {
      this.$emit('click', e)
    },
    onMouseDown (e: Event) {
      this.hasMouseDown = true
      this.$emit('mousedown', e)
    },
    onMouseUp (e: Event) {
      this.hasMouseDown = false
      this.$emit('mouseup', e)
    },
  },

  render (h): VNode {
    return h('div', this.setTextColor(this.computedColor, {
      staticClass: 'v-input',
      attrs: {
        tabindex: 0,
      },
      on: {
        focus: (e: any) => {
          this.hasFocus = true
          this.$emit('focus', e)
        },
        blur: (e: any) => {
          this.hasFocus = false
          this.$emit('blur', e)
        },
      },
      class: this.classes,
    }), this.genContent())
  },
})
