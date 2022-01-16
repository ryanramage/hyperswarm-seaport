import test from 'tape'
import { bind } from '../lib/bind.js'

test('scoped package.js', t => {
  bind()
  t.end()
})
