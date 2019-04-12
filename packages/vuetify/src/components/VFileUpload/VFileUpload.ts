// Styles
import './VFileUpload.sass'

// Components
import VProgressLinear from '../VProgressLinear'
import VBtn from '../VBtn/VBtn'
import VIcon from '../VIcon/VIcon'

// Mixins
import Uploadable from '../../mixins/uploadable/uploadable'

// Types
import mixins from '../../util/mixins'
import { VNode } from 'vue'

export default mixins(
  Uploadable
).extend({
  name: 'VFileUpload',

  props: {
    accept: {
      type: String,
      default: '*'
    },
    color: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    uploader: {
      type: Function,
      default: undefined
    },
    uploadOnSelect: {
      type: Boolean,
      default: false
    },
    validator: {
      type: Function,
      default: undefined
    }
  },

  data: () => ({
    isUploading: false
  }),

  computed: {
    classes () {
      return {
        'v-file-upload': true
      }
    },
    isLabelActive () {},
    shouldShowProgress (): Boolean {
      return this.isLoading || this.isUploading || this.uploadProgress > 0
    }
  },

  methods: {
    clearableCallback () {},
    genFiles () {
      return this.internalFiles.map((file: File) =>
        this.$createElement('div', {
          staticClass: 'v-file-upload__selection'
        }, file.name)
      )
    },
    genBtn () {
      return this.$slots.progress || this.$createElement(VBtn, {
        props: { icon: true },
        on: {
          click: this.onClick
        }
      }, [
        this.$createElement(VIcon, {}, '$vuetify.icons.menu'),
        this.genInput()
      ])
    },
    genInput () {
      return this.$createElement('input', {
        staticClass: 'v-file-upload__input',
        attrs: {
          type: 'file',
          accept: this.accept,
          multiple: this.multiple,
          disabled: this.disabled
        },
        ref: 'fileInput'
      })
    },
    genProgress () {
      if (!this.shouldShowProgress) return null

      return this.$slots.progress || this.$createElement(VProgressLinear, {
        props: {
          active: this.isUploading,
          color: this.color,
          height: 2,
          value: this.uploadProgress
        }
      })
    },
    getInput () {
      return this.$refs.fileInput
    },
    onClick (e: Event) {
      this.openFiles(e)
    }
  },

  render (h): VNode {
    return h(
      'div',
      [this.genBtn()]
    )
  }
})
