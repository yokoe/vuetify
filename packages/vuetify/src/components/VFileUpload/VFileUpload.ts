// Styles
import './VFileUpload.sass'

// Components
import VBtn from '../VBtn/VBtn'
import VIcon from '../VIcon/VIcon'
import VProgressLinear from '../VProgressLinear'
import VSheet from '../VSheet/VSheet'

// Types
import { VNode, VNodeData } from 'vue'

export default VSheet.extend({
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
    multiple: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
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
    internalFiles: [] as any[],
    isUploading: false,
    isValidating: false,
    isUploaded: false,
    isValid: false,
    uploadProgress: 0
  }),

  computed: {
    classes (): Object {
      const classes: Record<string, boolean> = {
        ...VSheet.options.computed.classes.call(this),
        'v-file-upload': true
      }
      return classes
    },
    shouldShowProgress (): Boolean {
      return this.isValidating || this.isUploading || this.uploadProgress > 0
    },
    label (): String {
      const text = (this.internalFiles.length === 1) ? 'File' : 'Files'
      return (this.internalFiles.length > 0) ? `${this.internalFiles.length} ${text}` : 'Upload File'
    }
  },

  methods: {
    openFiles (e: Event) {
      const input = this.getInput()
      if (e.target !== input) {
        input.click && input.click()
      }
    },
    onFileChange (e: Event) {
      const { files } = this.getInput()
      this.isUploaded = false
      if (files.length > 0) {
        this.internalFiles = [...files].map(file => {
          return Object.assign(file, {
            isPending: true,
            isUploading: false,
            isValidating: false,
            hasError: false,
            error: ''
          })
        })
      } else {
        this.onClear()
      }
      if (this.uploadOnSelect) {
        const uploaded = this.uploadFiles()
        console.log('uploading', uploaded)
      }
    },
    uploadFiles () {},
    genHeader () {
      return this.$createElement('div', {
        staticClass: 'v-file-upload__header'
      }, [
        this.genInputBtn(),
        this.$createElement('span', this.label as VNodeData),
        this.$createElement('div', { class: 'spacer' }),
        this.genUploadBtn(),
        this.genClearBtn()
      ])
    },
    genFiles () {
      return this.internalFiles.map((file: File) =>
        (this.$createElement('div', {
          staticClass: 'v-file-upload__file'
        }, file.name))
      )
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
    genInputBtn (): VNode {
      return this.$createElement(VBtn, {
        props: { icon: true },
        on: { click: this.onClick }
      }, [
        this.$createElement(VIcon, {}, 'cloud_upload'),
        this.genInput()
      ])
    },
    genUploadBtn (): VNode | null {
      return (this.internalFiles.length > 0 && !this.uploadOnSelect)
        ? this.$createElement(VBtn, {
          props: { icon: true },
          on: { click: this.uploadFiles }
        }, [
          this.$createElement(VIcon, {}, 'alarm_on')
        ])
        : null
    },
    genClearBtn (): VNode | null {
      return (this.internalFiles.length > 0)
        ? this.$createElement(VBtn, {
          props: { icon: true },
          on: { click: this.onClear }
        }, [
          this.$createElement(VIcon, {}, 'close')
        ])
        : null
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
    getInput (): any {
      return this.$refs.fileInput
    },
    onClick (e: Event) {
      this.openFiles(e)
    },
    onClear () {
      this.$refs.fileInput.value = null
      this.internalFiles = []
      this.isUploaded = false
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
