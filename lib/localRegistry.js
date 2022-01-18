import DHT from '@hyperswarm/dht'
import JRPC from 'json-rpc-on-a-stream'

export default class LocalRegistry {
  constructor (remoteRegistryPublicKey) {
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
    const registration =  await this.rpc.request('waitFor', meta)
    this.cached[meta.hash] = registration
  }

  get (meta) {
    const registration = this.cached[meta.hash]
    return registration.info.id // the id is the servicePublicKey
  }

  async register (meta, servicePublicKey) {
    this.rpc.request('register', { meta, servicePublicKey })
  }

  destroy () {
    this.rpc.destroy()
  }
}
