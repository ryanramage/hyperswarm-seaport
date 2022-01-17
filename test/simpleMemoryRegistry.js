import test from 'tape'
import SimpleMemoryRegistry from '../lib/impl/simpleMemoryRegistry.js'

test('waiting for times out', t => {
  const simpleMemoryRegistry = new SimpleMemoryRegistry({ waitForTimeout: 2000 })
  simpleMemoryRegistry.waitFor({ role: 'web', version: '1.x' }).then(info => {
    t.fail('should have timed out')
  }).catch(e => {
    t.ok(e)
    simpleMemoryRegistry.stopWaitingForExpiry()
    t.end()
  })
  simpleMemoryRegistry.startWaitingForExpiry()
})

test('waitFor fullfills when a service that matches is registered', t => {
  const simpleMemoryRegistry = new SimpleMemoryRegistry({ waitForTimeout: 2000 })
  simpleMemoryRegistry.waitFor({ role: 'web', version: '1.x' }).then(info => {
    t.equals(info.id, '1')
    simpleMemoryRegistry.stopWaitingForExpiry()
    t.end()
  }).catch(e => {
    t.fail('should not have timed out')
  })
  simpleMemoryRegistry.startWaitingForExpiry()
  setTimeout(() => {
    simpleMemoryRegistry.register('1', '2', { role: 'web', version: '1.3.1' })
  }, 1100)
})

test('waitFor times out when a service is registered that does not match', t => {
  const simpleMemoryRegistry = new SimpleMemoryRegistry({ waitForTimeout: 2000 })
  simpleMemoryRegistry.waitFor({ role: 'web', version: '1.x' }).then(info => {
    t.fail('should have timed out')
  }).catch(e => {
    t.ok(e)
    simpleMemoryRegistry.stopWaitingForExpiry()
    t.end()
  })
  simpleMemoryRegistry.startWaitingForExpiry()
  setTimeout(() => {
    simpleMemoryRegistry.register('1', '2', { role: 'badness', version: '1.3.1' })
  }, 1100)
})

test('a few registrations return a random entry', t => {
  const simpleMemoryRegistry = new SimpleMemoryRegistry()
  simpleMemoryRegistry.register('1', '1', { role: 'web', version: '1.3.1' })
  simpleMemoryRegistry.register('2', '2', { role: 'web', version: '1.3.1' })
  simpleMemoryRegistry.register('3', '3', { role: 'web', version: '1.3.1' })

  const results = simpleMemoryRegistry.query({ role: 'web', version: '1.3.x' })
  t.ok(results)
  t.end()
})
