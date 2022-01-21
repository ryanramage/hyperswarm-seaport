import getPort from 'get-port'
import * as AtekNet from '@atek-cloud/network'
import { toBase32, fromBase32 } from '@atek-cloud/network/dist/util.js'

import bind from './lib/bind.js'
import Client from './lib/client.js'
import fixMeta from './lib/fixMeta.js'
import LocalRegistry from './lib/localRegistry.js'
import SimpleMemoryRegistry from './lib/impl/simpleMemoryRegistry.js'

export default class Seaport {

  constructor (registryPubkey) {
    this.registryPubkey = fromBase32(registryPubkey)
  }

  async register (roleVersion) {
    await AtekNet.setup()
    const port = await getPort(this.portOptions)
    console.log('binding to port', port)
    const meta = fixMeta(roleVersion)
    const keyPair = AtekNet.createKeypair()
    bind('localhost', port, keyPair)
    const servicePublicKey = toBase32(keyPair.publicKey)
    this.localRegistry = new LocalRegistry(this.registryPubkey)
    this.localRegistry.register(meta, servicePublicKey)
    console.log('connected to registry', toBase32(this.registryPubkey))
    console.log('service running on port', port, 'and pubkey', servicePublicKey)
    return port
  }

  async get (roleVersion) {
    await AtekNet.setup()
    const meta = fixMeta(roleVersion)
    this.localRegistry = new LocalRegistry(this.registryPubkey)
    const client = new Client(this.localRegistry)
    return await client.get(meta)
  }
}
