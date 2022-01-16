import test from 'tape'
import fixMeta from '../lib/fixMeta.js'

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

test('can pass an object to fix meta', t => {
  const _meta = { role: '@hyper/web', version: '1.2.3' }
  const meta = fixMeta(_meta)
  t.equals(meta.role, '@hyper/web')
  t.equals(meta.version, '1.2.3')
  t.end()
})

test('can pass an object to fix meta, no prefix role', t => {
  const _meta = { role: 'web', version: '1.2.3' }
  const meta = fixMeta(_meta)
  t.equals(meta.role, 'web')
  t.equals(meta.version, '1.2.3')
  t.end()
})

test('can pass an object to fix meta', t => {
  const _meta = { role: '@hyper/web@1.2.3' }
  const meta = fixMeta(_meta)
  t.equals(meta.role, '@hyper/web')
  t.equals(meta.version, '1.2.3')
  t.end()
})
