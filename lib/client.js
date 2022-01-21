import net from 'net'
import getPort from 'get-port'
import * as AtekNet from '@atek-cloud/network'
import pump from 'pump'
import { toBase32, fromBase32 } from '@atek-cloud/network/dist/util.js'


// portOptions are from https://github.com/sindresorhus/get-port
export default class Client {
  constructor (localRegistry, portOptions) {
    this.metaHashToPort = {}
    this.localRegistry = localRegistry
    this.portOptions = portOptions
  }

  async get (meta, _port) {
    if (this.metaHashToPort[meta.hash]) return this.metaHashToPort[meta.hash].port

    const keyPair = AtekNet.createKeypair() // disposable
    const localPeerNode = new AtekNet.Node(keyPair)
    console.log('calling the registry')
    await this.localRegistry.waitFor(meta) // this is for the first time, can block a while
    console.log('found')

    const port = _port || await getPort(this.portOptions) // find an open port
    const localPortServer = net.createServer(async (socket) => {
      let conn
      try {
        console.log('got a socket!')
        const servicePublicKey = this.localRegistry.get(meta)
        console.log('hi')
        conn = await localPeerNode.connect(fromBase32(servicePublicKey))
        console.log('bye')
      } catch (e) {
        console.error('Failed to establish a connection over the p2p network')
        console.error(e)
        socket.destroy()
        return
      }
      if (!conn) return
      console.log('pumping', port)
      pump(socket, conn.stream, socket)
    })
    localPortServer.listen(port)
    console.log('localport listening')
    this.metaHashToPort[meta.hash] = { port, localPortServer, localPeerNode }
    return { host: 'localhost', port }
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     console.log('resolveing')
    //     resolve({ host: 'localhost', port })
    //   }, 600)
    // })
  }
}
