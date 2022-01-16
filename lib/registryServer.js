import DHT  from '@hyperswarm/dht'
import JRPC from 'json-rpc-on-a-stream'
import { fromBase32, toBase32 } from '@atek-cloud/network/dist/util.js'

export default class RegistryServer {
  constructor(registryImpl, dhtOptions) {
    const node = new DHT(dhtOptions)
    const rpcConnections = []

    this.server = node.createServer()
    this.server.on('connection', function (noiseSocket) {
      const remotePublicKey = toBase32(noiseSocket.remotePublicKey)
      console.log('Remote public key', remotePublicKey)

      const rpc = new JRPC(noiseSocket)
      rpc.respond('register', async (servicePublicKey, meta) => registryImpl.register(remotePublicKey, servicePublicKey, meta))
      rpc.respond('waitFor', async (meta) => await registryImpl.waitFor(meta))
      rpc.respond('query', (meta) => registryImpl.query(meta))
      rpcConnections.push(rpc)

      noiseSocket.on('close', () => registryImpl.remove(remotePublicKey))
    })
    this.keyPair = DHT.keyPair()
  }
  async start () {
    await this.server.listen(this.keyPair)
    return this.keyPair
  }
}