import { storiesOf } from '@storybook/vue';

storiesOf('VTextField', module)
  .add('default', () => `
    <v-text-field label="Foo"></v-text-field>
  `, {
    eyes: {
      variations: ['rtl', 'dark']
    }
  })
