import { configure, addDecorator } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';
import { withA11y } from '@storybook/addon-a11y';
import { withTemplate } from '~storybook/addon-show-vue-markup';
import { withVuetify } from '~storybook/decorator';

addDecorator(withTemplate)
addDecorator(withKnobs)
addDecorator(withA11y)
addDecorator(withVuetify)

const req = require.context('../stories/', true, /index\.js$/)

function loadStories() {
  const keys = req.keys()
  for (let i = 0; i < keys.length; i++) {
    req(keys[i])
  }
}

configure(loadStories, module)
