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
    fileDetails: {
      type: Boolean,
      default: false
    },
    uploader: {
      type: Function,
      default: undefined
    },
    readAs: {
      type: String,
      validator (val: string) {
        return [
          'BinaryString',
          'DataURL',
          'Text'
        ].includes(val)
      }
    }
  },

  data: () => ({
    internalFiles: [] as any[]
  }),

  computed: {
    classes (): Object {
      const classes: Record<string, boolean> = {
        ...VSheet.options.computed.classes.call(this),
        'v-file-upload': true
      }
      return classes
    },
    overallProgress (): number {
      const totalProgress = this.internalFiles.reduce((progress: number, file: any) => progress + file.uploadProgress, 0)
      return (this.internalFiles.length > 0)
        ? Math.ceil(totalProgress / this.internalFiles.length)
        : 0
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
      if (files.length > 0) {
        this.internalFiles = [...files].map(file => {
          return Object.assign(file, {
            isUploading: false,
            error: '',
            uploadProgress: 0
          })
        })
      } else {
        this.onClear()
      }
      if (this.uploadOnSelect) {
        this.uploadFiles()
      }
    },
    updateFile (ind: number, val: Object) {
      this.internalFiles.splice(ind, 1, Object.assign(this.internalFiles[ind], val))
    },
    startReader (file: File, ind: number) {
      const reader = new FileReader()

      reader.onload = e => {
        const data = reader.result
        this.startUploader(file, ind, data)
      }

      // reader[this.readAs](file)
      switch (this.readAs) {
        case 'BinaryString' :
          reader.readAsBinaryString(file)
          break
        case 'DataURL' :
          reader.readAsDataURL(file)
          break
        case 'Text' :
          reader.readAsText(file)
          break
      }
    },
    startUploader (file: File, ind: number, data = undefined as any) {
      this.updateFile(ind, { isUploading: true })
      if (this.uploader) {
        new Promise<boolean>(resolve => resolve(this.uploader(file, data)))
          .then(uploadRes => {
            const error = (uploadRes) ? '' : 'Upload Failed'
            const uploadProgress = (uploadRes) ? 100 : 0
            this.updateFile(ind, {
              success: !!uploadRes,
              error,
              isUploading: false,
              uploadProgress
            })
          })
      }
    },
    uploadFiles () {
      [...this.internalFiles].forEach((file, ind) => {
        if (this.readAs) {
          this.startReader(file, ind)
        } else {
          this.startUploader(file, ind)
        }
        return true
      })
    },
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
      return this.internalFiles.map((file: any) => {
        const children = (this.fileDetails)
          ? [file.name, file.size, file.type]
          : [file.name]

        children.push(
          this.$createElement(VProgressLinear, {
            props: {
              color: (file.error) ? 'error' : 'primary',
              value: file.uploadProgress,
              indeterminate: file.isUploading
            }
          })
        )
        return this.$createElement('div', {
          staticClass: 'v-file-upload__file'
        }, children)
      })
    },
    genFooter () {
      return this.$createElement('div', {
        staticClass: 'v-file-upload__footer'
      }, [
        this.$createElement('span', 'Uploading'),
        this.genProgress(),
        this.$createElement('span', `${this.overallProgress}%`)
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
      if (!this.overallProgress) return null

      return this.$slots.progress || this.$createElement(VProgressLinear, {
        props: {
          height: 5,
          value: this.overallProgress
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
    }
  },

  render (h): VNode {
    const children = [
      this.genHeader(),
      this.genFiles(),
      this.genFooter()
    ]
    const data = {
      class: this.classes,
      style: this.styles,
      on: this.$listeners
    }

    return h('div', data, children)
  }
})
