import { fromBase32, toBase32 } from '@atek-cloud/network/dist/util.js'

import RegistryServer from '../../lib/registryServer.js'
import LocalRegistry from '../../lib/localRegistry.js'
import SimpleMemoryRegistry from '../../lib/impl/simpleMemoryRegistry.js'

async function test () {
  const registry = new SimpleMemoryRegistry()
  const registryServer = new RegistryServer(registry)
  const keyPair = await registryServer.start()
  console.log(`Registry listening connect with pubkey ${toBase32(keyPair.publicKey)}`)

  const localRegistry = new LocalRegistry(keyPair.publicKey)
  const meta = { role: 'web', version: '1.2.2' }
  const fakeServicePublicKey = '1233333444455a'
  localRegistry.register(meta, fakeServicePublicKey)


  setTimeout(() => {
    // find a service
    const localRegistry = new LocalRegistry(keyPair.publicKey)
    const meta = { role: 'web', version: '1.2.x' }
    localRegistry.query(meta)
  }, 5000)


}

test()
