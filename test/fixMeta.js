const test = require('tape')
const fixMeta = require('../lib/fixMeta')

test('normal roles from package.js', t => {
  const meta = fixMeta('web@1.2.3')
  t.equals(meta.role, 'web')
  t.equals(meta.version, '1.2.3')
  t.end()
})

test('scoped package.js', t => {
  const meta = fixMeta('@hyper/web@1.2.3')
  t.equals(meta.role, '@hyper/web')
  t.equals(meta.version, '1.2.3')
  t.end()
})
