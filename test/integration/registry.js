import { fromBase32, toBase32 } from '@atek-cloud/network/dist/util.js'

import RegistryServer from '../../lib/registryServer.js'
import LocalRegistry from '../../lib/localRegistry.js'
import SimplMemoryRegistry from '../../lib/registryImpl/simpleMemoryRegistry.js'

async function test () {
  const registry = new SimplMemoryRegistry()
  const registryServer = new RegistryServer(registry)
  const keyPair = await registryServer.start()
  console.log(`Registry listening connect with pubkey ${toBase32(keyPair.publicKey)}`)

  const localRegistry = new LocalRegistry(keyPair.publicKey)
  const meta = { role: 'web', version: '1.2.x' }
  //localRegistry.query(meta)

}

test()
