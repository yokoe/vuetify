// Styles
import './VTextField.sass'

// Extensions
import VInput from '../VInput'

// Components
import VCounter from '../VCounter'
import VLabel from '../VLabel'

// Mixins
import Maskable from '../../mixins/maskable'
import Loadable from '../../mixins/loadable'

// Directives
import Ripple from '../../directives/ripple'

// Utilities
import { getSlot, keyCodes } from '../../util/helpers'
import mixins from '../../util/mixins'

const baseMixins = mixins(
  VInput,
  Maskable,
  Loadable
)

const dirtyTypes = ['color', 'file', 'time', 'date', 'datetime-local', 'week', 'month']

/* @vue/component */
export default baseMixins.extend({
  name: 'v-text-field',

  directives: { Ripple },

  inheritAttrs: false,

  props: {
    autofocus: Boolean,
    browserAutocomplete: String,
    classic: Boolean,
    color: {
      type: String,
      default: 'primary'
    },
    counter: [Boolean, Number, String],
    flat: Boolean,
    fullWidth: Boolean,
    label: String,
    outline: Boolean,
    placeholder: String,
    prefix: String,
    reverse: Boolean,
    singleLine: Boolean,
    solo: Boolean,
    soloInverted: Boolean,
    suffix: String,
    type: {
      type: String,
      default: 'text'
    }
  },

  data: () => ({
    initialValue: null as unknown,
    internalChange: false,
    isClearing: false
  }),

  computed: {
    classes (): object {
      return {
        ...VInput.options.computed.classes.call(this),
        'v-text-field': true,
        'v-text-field--classic': this.classic,
        'v-text-field--full-width': this.fullWidth,
        'v-text-field--outline': this.outline,
        'v-text-field--placeholder': this.placeholder,
        'v-text-field--prefix': this.prefix,
        'v-text-field--reverse': this.reverse,
        'v-text-field--single-line': this.isSingle,
        'v-text-field--solo-flat': this.flat,
        'v-text-field--solo-inverted': this.soloInverted,
        'v-text-field--solo': this.isSolo
      }
    },
    counterValue () {
      return (this.internalValue || '').toString().length
    },
    internalValue: {
      get () {
        return this.internalLazyValue
      },
      set (val: any) {
        if (this.mask && val !== this.internalLazyValue) {
          this.internalLazyValue = this.unmaskText(this.maskText(this.unmaskText(val)))
          this.setSelectionRange()
        } else {
          this.internalLazyValue = val
          this.$emit('input', this.internalLazyValue)
        }
      }
    },
    isLabelActive () {
      return this.isDirty || dirtyTypes.includes(this.type)
    },
    isSingle () {
      return this.isSolo || this.singleLine
    },
    isSolo () {
      return this.solo || this.soloInverted
    },
    labelPosition () {
      const offset = (this.prefix && !this.labelValue) ? this.prefixWidth : 0

      return (!this.$vuetify.rtl !== !this.reverse) ? {
        left: 'auto',
        right: offset
      } : {
        left: offset,
        right: 'auto'
      }
    },
    showLabel () {
      return this.hasLabel && (!this.isSingle || (!this.isLabelActive && !this.placeholder && !this.prefixLabel))
    },
    labelValue () {
      return !this.isSingle &&
        Boolean(this.isFocused || this.isLabelActive || this.placeholder || this.prefixLabel)
    },
    prefixWidth () {
      if (!this.prefix && !this.$refs.prefix) return

      return this.$refs.prefix.offsetWidth
    },
    prefixLabel () {
      return (this.prefix && !this.value)
    }
  },

  watch: {
    isFocused (val) {
      // Sets validationState from validatable
      this.hasColor = val

      if (val) {
        this.initialValue = this.internalLazyValue
      } else if (this.initialValue !== this.internalLazyValue) {
        this.$emit('change', this.internalLazyValue)
      }
    },
    value (val) {
      if (this.mask && !this.internalChange) {
        const masked = this.maskText(this.unmaskText(val))
        this.internalLazyValue = this.unmaskText(masked)

        // Emit when the externally set value was modified internally
        String(val) !== this.internalLazyValue && this.$nextTick(() => {
          this.$refs.input.value = masked
          this.$emit('input', this.internalLazyValue)
        })
      } else this.internalLazyValue = val
    }
  },

  mounted () {
    this.autofocus && this.onFocus()
  },

  methods: {
    /** @public */
    focus () {
      this.onFocus()
    },
    /** @public */
    blur () {
      this.$refs.input ? this.$refs.input.blur() : this.onBlur()
    },
    genCounter () {
      if (this.counter === false || this.counter == null) return null

      const max = this.counter === true ? this.$attrs.maxlength : this.counter

      return this.$createElement(VCounter, {
        props: {
          dark: this.dark,
          light: this.light,
          max,
          value: this.counterValue
        }
      })
    },
    genLabel () {
      if (!this.showLabel) return null

      const data = {
        props: {
          absolute: true,
          color: this.validationState,
          dark: this.dark,
          disabled: this.disabled,
          focused: !this.isSingle && (this.isFocused || !!this.validationState),
          for: this.$attrs.id,
          left: this.labelPosition.left,
          light: this.light,
          right: this.labelPosition.right,
          value: this.labelValue
        }
      }

      return this.$createElement(VLabel, data, getSlot(this, 'label') || this.label)
    },
    genInput () {
      const render = VInput.options.methods.genInput.call(this)

      const attrs = render.data!.attrs

      render.data!.attrs = {
        ...attrs,
        autocomplete: this.browserAutocomplete,
        maxlength: this.mask ? this.masked.length : undefined,
        placeholder: this.placeholder
      }

      return render
    },
    genMessages () {
      const render = VInput.options.methods.genMessages.call(this)

      if (!render) return null

      const counter = this.genCounter()

      if (counter) render.children!.push(counter)

      return render
    },
    genInputSlot () {
      const render = VInput.options.methods.genInputSlot.call(this)

      if (this.prefix) {
        render.children!.unshift(this.genAffix('prefix'))
      }

      if (this.suffix) {
        render.children!.push(this.genAffix('suffix'))
      }

      return render
    },
    genAffix (type: 'prefix' | 'suffix') {
      return this.$createElement('div', {
        staticClass: `v-text-field__${type}`,
        ref: type
      }, this[type])
    },
    onBlur (e?: Event) {
      this.isFocused = false
      // Reset internalChange state
      // to allow external change
      // to persist
      this.internalChange = false

      this.$emit('blur', e)
    },
    onClick () {
      if (this.isFocused || this.disabled) return

      this.$refs.input.focus()
    },
    onFocus (e?: Event) {
      if (!this.$refs.input) return

      if (document.activeElement !== this.$refs.input) {
        return this.$refs.input.focus()
      }

      if (!this.isFocused) {
        this.isFocused = true
        e && this.$emit('focus', e)
      }
    },
    onInput (e: Event) {
      VInput.options.methods.onInput.call(this, e)

      const target = e.target as HTMLInputElement
      this.internalChange = true
      this.mask && this.resetSelections(target)
    },
    onKeyDown (e: KeyboardEvent) {
      this.internalChange = true

      if (e.keyCode === keyCodes.enter) this.$emit('change', this.internalValue)

      this.$emit('keydown', e)
    },
    onMouseDown (e: Event) {
      // Prevent input from being blurred
      if (e.target !== this.$refs.input) {
        e.preventDefault()
        e.stopPropagation()
      }

      VInput.options.methods.onMousedown.call(this, e)
    },
    onMouseUp (e: Event) {
      if (this.hasMouseDown) this.focus()

      VInput.options.methods.onMouseup.call(this, e)
    }
  }
})
