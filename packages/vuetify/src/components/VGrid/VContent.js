// Styles
import '../../stylus/components/_content.styl'

// Mixins
import SSRBootable from '../../mixins/ssr-bootable'

/* @vue/component */
export default {
  name: 'v-content',

  mixins: [SSRBootable],

  props: {
    tag: {
      type: String,
      default: 'main'
    }
  },

  computed: {
    styles () {
      const {
        bar, top, right, footer, insetFooter, bottom, left
      } = this.$vuetify.application

      const offset = this.$vuetify.breakpoint.mdAndUp ? 24 : 16

      return {
        paddingTop: `${top + bar + offset}px`,
        paddingRight: `${right + offset}px`,
        paddingBottom: `${footer + insetFooter + bottom + offset}px`,
        paddingLeft: `${left + offset}px`
      }
    }
  },

  render (h) {
    const data = {
      staticClass: 'v-content',
      style: this.styles,
      ref: 'content'
    }

    return h(this.tag, data, [
      h(
        'div',
        { staticClass: 'v-content__wrap' },
        this.$slots.default
      )
    ])
  }
}
