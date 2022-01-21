import DHT from '@hyperswarm/dht'
import JRPC from 'json-rpc-on-a-stream'
import { toBase32, fromBase32 } from '@atek-cloud/network/dist/util.js'

export default class LocalRegistry {
  constructor (remoteRegistryPublicKey) {
    if (typeof remoteRegistryPublicKey === 'string') {
      remoteRegistryPublicKey = fromBase32(remoteRegistryPublicKey)
    }
    this.remoteRegistryPublicKey = remoteRegistryPublicKey
    this.node = new DHT()
    const noiseSocket = this.node.connect(remoteRegistryPublicKey)
    noiseSocket.on('open', () => console.log('connected to peer'))
    this.rpc = new JRPC(noiseSocket)
    this.cached = {}
  }

  async query (meta) {
    return await this.rpc.request('query', meta)
  }

  async waitFor (meta) {
    console.log('getting the waitfor')
    const registration =  await this.rpc.request('waitFor', meta)
    this.cached[meta.hash] = registration
    console.log('we cached', registration)
  }

  get (meta) {
    const registration = this.cached[meta.hash]
    console.log('we found a registration', registration)
    return registration.info.id // the id is the servicePublicKey
  }

  async register (meta, servicePublicKey) {
    if (typeof servicePublicKey === 'object') {
      servicePublicKey = toBase32(servicePublicKey)
    }
    this.rpc.request('register', { meta, servicePublicKey })
  }

  destroy () {
    this.rpc.destroy()
  }
}
