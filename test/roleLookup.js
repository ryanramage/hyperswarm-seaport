import test from 'tape'
import RoleLookup from '../lib/roleLookup.js'

test('seting and getting role info, deleting', t => {
  const roleLookup = new RoleLookup(true)
  const meta = { role: 'web', version: '1.2.3' }
  const info = { something: true, important: false, id: 'test' }
  const registrations = roleLookup.add(meta, info)
  t.ok(registrations)

  const found = roleLookup.get({ role: 'web', version: '1.x' })
  t.equals(found.list.length, 1)

  roleLookup.remove('test')

  const found2 = roleLookup.get({ role: 'web', version: '1.x' })
  t.equals(found2.list.length, 0)

  t.end()
})
