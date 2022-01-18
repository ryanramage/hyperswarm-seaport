import net from 'net'
import getPort from 'get-port'
import * as AtekNet from '@atek-cloud/network'
import pump from 'pump'

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

    await this.localRegistry.waitFor(meta) // this is for the first time, can block a while

    const port = _port // await getPort(this.portOptions) // find an open port
    const localPortServer = net.createServer(async (socket) => {
      let conn
      try {
        const servicePublicKey = this.localRegistry.get(meta)
        conn = await localPeerNode.connect(servicePublicKey)
      } catch (e) {
        console.error('Failed to establish a connection over the p2p network')
        console.error(e)
        socket.destroy()
        return
      }
      if (!conn) return
      pump(socket, conn.stream, socket)
    })
    localPortServer.listen(port)
    this.metaHashToPort[meta.hash] = { port, localPortServer, localPeerNode }
    return { host: 'localhost', port }
  }
}
