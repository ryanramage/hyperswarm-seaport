import DHT from '@hyperswarm/dht'
import JRPC from 'json-rpc-on-a-stream'

export default class LocalRegistry {
  constructor(remoteRegistryPublicKey) {
    this.remoteRegistryPublicKey = remoteRegistryPublicKey
    this.node = new DHT()
    const noiseSocket = this.node.connect(remoteRegistryPublicKey)
    noiseSocket.on('open', function () {
      console.log('connected to peer')
    })
    this.rpc = new JRPC(noiseSocket)
  }

  async query (meta) {
    const result = await this.rpc.request('query', meta)
    console.log('we got a result', result)
  }

  async register (meta, servicePublicKey) {

  }

  destroy () {
    this.rpc.destroy()
  }

}
