import Eyes from '@applitools/eyes-testcafe'
const eyes = new Eyes()

fixture`VTextField`
  .page('http://localhost:6006/?path=/story/vtextfield--default')
  // .beforeEach(async t => {
  //   await eyes.open({
  //     appName: 'vuetify-test',
  //     testName: 'vtextfield--default',
  //     browser: [{ width: 800, height: 600, name: 'chrome' }],
  //     t
  //   })

  //   await t.switchToIframe('#storybook-preview-iframe')
  // })
  .afterEach(async () => eyes.close)
  .after(async () => eyes.waitForResults())

test('should focus on click', async t => {
  await eyes.open({
    testName: 'should focus on click',
    t
  })

  await t.switchToIframe('#storybook-preview-iframe')
  await eyes.checkWindow('Base')
  await t.click('.v-text-field')
  await eyes.checkWindow('Click')
})

test('should do something else', async t => {
  await eyes.open({
    testName: 'should do something else',
    t
  })

  await t.switchToIframe('#storybook-preview-iframe')
  await eyes.checkWindow('Base')
})
