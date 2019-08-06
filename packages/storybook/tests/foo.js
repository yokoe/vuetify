import Eyes from '@applitools/eyes-testcafe'
const eyes = new Eyes()

fixture`Getting Started`
  .page('http://localhost:6006/?path=/story/vtabs--default')
  .afterEach(async () => eyes.close)
  .after(async () => eyes.waitForResults())

test('foo', async t => {
  await eyes.open({
    appName: 'vuetify-test',
    testName: 'vtabs--default',
    browser: [{ width: 800, height: 600, name: 'chrome' }],
    t
  })

  await t.switchToIframe('#storybook-preview-iframe')
  await eyes.checkWindow('Base')
  await t.click('#bar')
  await eyes.checkWindow('Click')
})
