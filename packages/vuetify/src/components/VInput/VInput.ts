// Styles
import './VInput.sass'

// Components
import VIcon from '../VIcon'
import VLabel from '../VLabel'
import VMessages from '../VMessages'

// Mixins
import Colorable from '../../mixins/colorable'
import Proxyable from '../../mixins/proxyable'
import Themeable from '../../mixins/themeable'
import Validatable from '../../mixins/validatable'

// Utilities
import {
  convertToUnit,
  kebabCase,
  getSlot
} from '../../util/helpers'
import mixins from '../../util/mixins'

// Types
import { VNode, VNodeData } from 'vue'

const baseMixins = mixins(
  Colorable,
  Themeable,
  Validatable
)

interface options extends InstanceType<typeof baseMixins> {
  /* eslint-disable-next-line camelcase */
  $_modelEvent: string
  $refs: {
    input: HTMLInputElement
    prefix: HTMLElement
    suffix: HTMLElement
  }
}

/* @vue/component */
export default baseMixins.extend<options>().extend({
  name: 'v-input',

  props: {
    appendIcon: String,
    appendOuterIcon: String,
    backgroundColor: {
      type: String,
      default: ''
    },
    clearable: Boolean,
    clearIcon: {
      type: String,
      default: '$vuetify.icons.clear'
    },
    height: [Number, String],
    hideDetails: Boolean,
    hint: String,
    label: String,
    loading: Boolean,
    persistentHint: Boolean,
    prependIcon: String,
    prependInnerIcon: String,
    type: {
      type: String,
      default: 'text'
    }
  },

  data () {
    return {
      attrsInput: {},
      badInput: false,
      internalLazyValue: this.value,
      hasMouseDown: false
    }
  },

  computed: {
    __cachedClearIcon () {
      if (!this.clearable) return null

      const icon = !this.isDirty ? '' : 'clear'

      return this.genSlot('append', 'inner', [
        this.genIcon(
          icon,
          !this.$listeners['click:clear'] && this.clearableCallback
        )
      ])
    },
    classes (): object {
      return {
        'v-input--has-state': this.hasState,
        'v-input--hide-details': this.hideDetails,
        'v-input--is-label-active': this.isLabelActive,
        'v-input--is-dirty': this.isDirty,
        'v-input--is-disabled': this.disabled,
        'v-input--is-focused': this.isFocused,
        'v-input--is-loading': this.loading !== false && this.loading !== undefined,
        'v-input--is-readonly': this.readonly,
        ...this.themeClasses
      }
    },
    hasHint () {
      return !this.hasMessages &&
        this.hint &&
        (this.persistentHint || this.isFocused)
    },
    hasLabel () {
      return Boolean(getSlot(this, 'label') || this.label)
    },
    // Proxy for `internalLazyValue`
    // This allows an input
    // to function without
    // a provided model
    internalValue: {
      get () {
        return this.internalLazyValue
      },
      set (val: any) {
        this.internalLazyValue = val
        this.$emit(this.$_modelEvent, val)
      }
    },
    isDirty () {
      return (
        this.internalValue != null &&
        this.internalValue.toString().length > 0
      ) || this.badInput
    },
    isDisabled () {
      return Boolean(this.disabled || this.readonly)
    },
    isLabelActive () {
      return this.isDirty
    }
  },

  watch: {
    value (val) {
      this.internalLazyValue = val
    }
  },

  beforeCreate () {
    // v-radio-group needs to emit a different event
    // https://github.com/vuetifyjs/vuetify/issues/4752
    this.$_modelEvent = (this.$options.model && this.$options.model.event) || 'input'
  },

  methods: {
    clearableCallback () {
      this.internalValue = null
      this.$nextTick(() => this.$refs.input.focus())
    },
    genLocation (
      affix: 'clear-inner' | 'prepend-outer' | 'prepend-inner' | 'append-inner' | 'append-outer',
      camelAffix?: 'prependInner' | 'appendOuter'
    ) {
      const [slot, location] = affix.split('-')
      const children = []
      const hasSlot = getSlot(this, slot)

      if (hasSlot) {
        children.push(hasSlot)
      } else if ((this as any)[`${camelAffix || slot}Icon`]) {
        children.push(this.genIcon(camelAffix || slot as 'prepend' | 'append'))
      }

      return this.genSlot(slot, location, children)
    },
    genContent () {
      return [
        this.genLocation('prepend-outer'),
        this.genLocation('prepend-inner', 'prependInner'),
        this.genControl(),
        this.__cachedClearIcon,
        this.genLocation('append-inner'),
        this.genLocation('append-outer', 'appendOuter')
      ]
    },
    genControl () {
      return this.$createElement('div', {
        staticClass: 'v-input__control'
      }, [
        this.genInputSlot(),
        this.genMessages()
      ])
    },
    genDefaultSlot () {
      return [
        this.genLabel(),
        this.genInput(),
        getSlot(this)
      ]
    },
    genIcon (
      type: '' | 'clear' | 'prepend' | 'prependInner' | 'append' | 'appendOuter',
      cb?: false | ((e: Event) => void)
    ) {
      const icon = (this as any)[`${type}Icon`]
      const eventName = `click:${kebabCase(type)}`

      const data: VNodeData = {
        props: {
          color: this.validationState,
          dark: this.dark,
          disabled: this.disabled,
          light: this.light
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
            // Container has mouseup event that will
            // trigger menu open if enclosed
            mouseup: (e: Event) => {
              e.preventDefault()
              e.stopPropagation()
            }
          }
      }

      return this.$createElement('div', {
        staticClass: `v-input__icon v-input__icon--${kebabCase(type)}`,
        key: `${type}${icon}`
      }, [
        this.$createElement(
          VIcon,
          data,
          icon
        )
      ])
    },
    genInput () {
      const listeners = Object.assign({}, this.$listeners)
      delete listeners['change'] // Change should not be bound externally

      const data = {
        style: {},
        domProps: {
          value: this.internalValue
        },
        attrs: {
          'aria-label': (!this.$attrs || !this.$attrs.id) && this.label, // Label `for` will be set if we have an id
          ...this.$attrs,
          disabled: this.disabled,
          readonly: this.readonly,
          type: this.type
        },
        on: Object.assign(listeners, {
          blur: this.onBlur,
          input: this.onInput,
          focus: this.onFocus,
          keydown: this.onKeydown
        }),
        ref: 'input'
      }

      return this.$createElement('input', data)
    },
    genInputSlot () {
      return this.$createElement('div', this.setBackgroundColor(this.backgroundColor, {
        staticClass: 'v-input__slot',
        style: { height: convertToUnit(this.height) },
        on: {
          click: this.onClick,
          mousedown: this.onMousedown,
          mouseup: this.onMouseup
        },
        ref: 'input-slot'
      }), [this.genDefaultSlot()])
    },
    genLabel () {
      if (!this.hasLabel) return null

      return this.$createElement(VLabel, {
        props: {
          color: this.validationState,
          dark: this.dark,
          focused: this.hasState,
          for: this.$attrs.id,
          light: this.light
        }
      }, getSlot(this, 'label') || this.label)
    },
    genMessages () {
      if (this.hideDetails) return null

      const messages = this.hasHint
        ? [this.hint]
        : this.validations

      return this.$createElement(VMessages, {
        props: {
          color: this.hasHint ? '' : this.validationState,
          dark: this.dark,
          light: this.light,
          value: (this.hasMessages || this.hasHint) ? messages : []
        }
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
        ref
      }, slot)
    },
    onBlur (e: Event) {
      this.$emit('blur', e)
    },
    onClick (e: Event) {
      this.$emit('click', e)
    },
    onFocus (e: Event) {
      this.$emit('focus', e)
    },
    onInput (e: Event) {
      const target = e.target as HTMLInputElement

      this.internalValue = target.value
      this.badInput = target.validity && target.validity.badInput

      this.$emit('input', e)
    },
    onKeydown (e: Event) {
      this.$emit('keydown', e)
    },
    onMousedown (e: Event) {
      this.hasMouseDown = true
      this.$emit('mousedown', e)
    },
    onMouseup (e: Event) {
      this.hasMouseDown = false
      this.$emit('mouseup', e)
    }
  },

  render (h): VNode {
    return h('div', this.setTextColor(this.validationState, {
      staticClass: 'v-input',
      attrs: this.attrsInput,
      class: this.classes
    }), this.genContent())
  }
})
