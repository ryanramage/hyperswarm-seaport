import test from 'tape'
import RoleLookup from '../lib/roleLookup.js'

test('seting and getting role info', t => {
  const roleLookup = new RoleLookup()
  const meta = { role: 'web', version: '1.2.3' }
  const info ={ something: true, important: false }
  const registrations = roleLookup.add(meta, info)
  t.ok(registrations)

  const found = roleLookup.get({role: 'web', version: '1.x'})
  console.log('found', found)

  t.end()
})
