// Styles
import './VFileUpload.sass'

// Components
import VBtn from '../VBtn/VBtn'
import VIcon from '../VIcon/VIcon'
import VProgressLinear from '../VProgressLinear'
import VSheet from '../VSheet/VSheet'

// Types
import { VNode, VNodeChildren } from 'vue'

export default VSheet.extend({
  name: 'VFileUpload',

  props: {
    accept: {
      type: String,
      default: '*'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: ''
    },
    uploadOnSelect: {
      type: Boolean,
      default: false
    },
    uploader: {
      type: Function,
      default: undefined
    },
    validator: {
      type: Function,
      default: undefined
    }
  },

  data: () => ({
    internalFiles: [],
    isUploading: false,
    isValidating: false,
    uploadProgress: 0
  }),

  computed: {
    classes (): object {
      const classes: Record<string, boolean> = {
        ...VSheet.options.computed.classes.call(this),
        'v-file-upload': true
      }
      return classes
    },
    shouldShowProgress (): Boolean {
      return this.isValidating || this.isUploading || this.uploadProgress > 0
    },
    label () {
      return 'Upload File'
    }
  },

  methods: {
    openFiles (e: Event) {
      const input = this.getInput() as any

      if (e.target !== input) {
        input.click && input.click()
      }
    },
    onFileChange (e: Event) {
      this.internalFiles = Array.from(this.getInput().files)
    },
    uploadFiles () {},
    genFiles () {
      return this.internalFiles.map((file: File) =>
        (this.$createElement('div', {
          staticClass: 'v-file-upload__file'
        }, file.name))
      )
    },
    genHeader () {
      return this.$createElement('div', {
        staticClass: 'v-file-upload__header'
      }, [
        this.genBtn('cloud_upload', this.onClick, true),
        this.$createElement('span', this.label),
        this.$createElement('div', { class: 'spacer' }),
        this.genBtn('alarm_on', this.uploadFiles),
        this.genBtn('close', this.onClear)
      ])
    },
    genFooter () {
      return this.$createElement('div', {
        staticClass: 'v-file-upload__footer'
      }, [
        this.$createElement('span', 'Uploading'),
        this.genProgress(),
        this.$createElement('span', '%')
      ])
    },
    genBtn (icon: VNodeChildren, click: Function, input = false) {
      const children = [this.$createElement(VIcon, {}, icon)]
      if (input) {
        children.push(this.genInput())
      }

      return this.$createElement(VBtn, {
        props: { icon: true },
        on: { click }
      }, children)
    },
    genInput () {
      return this.$createElement('input', {
        staticClass: 'v-file-upload__input',
        attrs: {
          type: 'file',
          title: '',
          accept: this.accept,
          multiple: this.multiple,
          disabled: this.disabled
        },
        on: {
          change: this.onFileChange
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
      return this.$refs.fileInput as any
    },
    onClick (e: Event) {
      this.openFiles(e)
    },
    onClear () {
      this.$refs.fileInput.value = null
      this.internalFiles = []
    }
  },

  render (h): VNode {
    const children = [
      this.genHeader(),
      this.genFiles(),
      this.genFooter()
    ]
    const data = this.setBackgroundColor(this.color, {
      class: this.classes,
      style: this.styles,
      on: this.$listeners
    })

    return h('div', data, children)
  }
})
