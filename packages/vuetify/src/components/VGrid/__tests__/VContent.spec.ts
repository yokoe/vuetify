// Components
import VContent from '../VContent'

// Services
import { Application } from '../../../services/application'

// Utilities
import {
  mount,
  MountOptions,
  Wrapper
} from '@vue/test-utils'
import { rafPolyfill } from '../../../../test'

describe('VContent.ts', () => {
  type Instance = InstanceType<typeof VContent>
  let mountFunction: (options?: MountOptions<Instance>) => Wrapper<Instance>

  beforeEach(() => {
    mountFunction = (options = {} as MountOptions<Instance>) => {
      return mount(VContent, {
        mocks: {
          $vuetify: {
            application: new Application()
          }
        },
        ...options
      })
    }
  })

  rafPolyfill(window)

  it('should render', () => {
    const wrapper = mountFunction()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render with custom tag', () => {
    const wrapper = mountFunction({
      propsData: {
        tag: 'div'
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should calculate paddings', () => {
    const wrapper = mountFunction({
      mocks: {
        $vuetify: {
          application: {
            bar: 1,
            top: 2,
            right: 3,
            footer: 4,
            insetFooter: 5,
            bottom: 6,
            left: 7
          }
        }
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
