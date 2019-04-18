// Component factories
import grid from '../grid'

// Utilities
import {
  mount,
  MountOptions,
  Wrapper
} from '@vue/test-utils'
import { functionalContext } from '../../../../test'
import Vue, { VueConstructor } from 'vue'

describe('grid.ts', () => {
  type Instance = InstanceType<VueConstructor<{
    id: string
    tag: string
  } & Vue>>
  let mountFunction: (name?: string, options?: MountOptions<Instance>) => Wrapper<Instance>

  beforeEach(() => {
    mountFunction = (name = 'grid', options = {} as MountOptions<Instance>) => {
      return mount(grid(name), options)
    }
  })

  it('should render', () => {
    const wrapper = mountFunction()

    expect(wrapper.classes('grid')).toBeTruthy()
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render with any class name', () => {
    const wrapper = mountFunction('flex')

    expect(wrapper.classes('grid')).toBeFalsy()
    expect(wrapper.classes('flex')).toBeTruthy()
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render with any id', () => {
    const wrapper = mountFunction('grid', {
      context: {
        props: {
          id: 'test'
        }
      }
    })

    expect(wrapper.classes('grid')).toBeTruthy()
    expect(wrapper.attributes('id')).toBe('test')
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render with any tag', () => {
    const wrapper = mountFunction('grid', {
      context: {
        props: {
          tag: 'span'
        }
      }
    })

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes('grid')).toBeTruthy()
    expect(wrapper.html()).toMatchSnapshot()
  })
})
