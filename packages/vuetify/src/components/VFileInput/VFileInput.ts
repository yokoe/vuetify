import './VFileInput.sass'

import Vue, { VNode } from 'vue'
import VInput from '../VInput'
import mixins from '../../util/mixins'
import { consoleError } from '../../util/console'
import { PropValidator } from 'vue/types/options'

interface options extends Vue {
  $refs: {
    input: HTMLInputElement
  }
}

function validate (value: any, rules: Function[]) {
  const errors = []

  for (let index = 0; index < rules.length; index++) {
    const rule = rules[index]
    const valid = typeof rule === 'function' ? rule(value) : rule

    if (typeof valid === 'string') {
      errors.push(valid)
    } else if (typeof valid !== 'boolean') {
      consoleError(`Rules should return a string or boolean, received '${typeof valid}' instead`)
    }
  }

  return errors
}

export default mixins<options>().extend({
  name: 'v-file-input',

  props: {
    ...VInput.options.props,
    clearable: Boolean,
    multiple: Boolean,
    prependIcon: {
      type: String,
      default: '$vuetify.icons.file',
    },
    rules: {
      type: Array,
      default: () => ([]),
    } as PropValidator<Function[]>,
    placeholder: String,
    color: {
      type: String,
      default: 'primary',
    },
  },

  data: () => ({
    files: [] as any as FileList,
    errors: [] as string[],
  }),

  watch: {
    files: {
      handler (v) {
        this.errors = validate(v, this.rules)
      },
      deep: true,
    },
  },

  computed: {
    hasFiles (): boolean {
      return this.files && !!this.files.length
    },
    text (): string {
      if (!this.files || !this.files.length) return this.placeholder

      // TODO: use $t for X selected
      return this.files.length > 1 ? `${this.files.length} files selected` : this.files[0].name
    },
  },

  methods: {
    genInput () {
      return this.$createElement('input', {
        ref: 'input',
        attrs: {
          id: this.id,
          hidden: true,
          type: 'file',
          multiple: this.multiple,
        },
        on: {
          change: (e: any) => {
            this.files = e.target.files
          },
        },
      })
    },
    genText () {
      return this.$createElement('div', {
        staticClass: 'v-file-input__text',
      }, [this.text])
    },
    click () {
      this.$refs.input.click()
    },
  },

  render (h): VNode {
    const props: Record<string, any> = {
      ...this.$props,
      dirty: this.$props.dirty || this.hasFiles,
      absoluteLabel: true,
      hasPlaceholder: !!this.placeholder,
    }

    const on: Record<string, any> = {
      ...this.$listeners,
      'click:prepend': this.click,
    }

    if (this.clearable) {
      props.appendIcon = '$vuetify.icons.close'
      on['click:append'] = () => {
        this.files = null as any as FileList
        this.$refs.input.value = ''
      }
    }

    if (this.errors.length) {
      props.state = 'error'
      props.messages = this.errors
    }

    return h(VInput, {
      staticClass: 'v-file-input',
      props,
      on,
      nativeOn: {
        keydown: (e: KeyboardEvent) => {
          if (e.keyCode === 32 || e.keyCode === 13) this.click()
        },
      },
    }, [
      this.genInput(),
      this.genText(),
    ])
  },
})
