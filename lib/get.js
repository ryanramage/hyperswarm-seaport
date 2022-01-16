import net from 'net'
import getPort from 'get-port'
import * as AtekNet from '@atek-cloud/network'
import { fromBase32, toBase32 } from '@atek-cloud/network/dist/util.js'
import pump from 'pump'

// portOptions are from https://github.com/sindresorhus/get-port
function Get (localRegistry, portOptions) {
  await AtekNet.setup() // TODO: move to main seaport instance
  this.metaHashToPort = {}
  this.localRegistry = localRegistry
  this.portOptions = portOptions
}

// implements the main seaport.get that a client role will use
Get.prototype.get = async function (meta) {
  if (this.metaHashToPort[meta.hash]) return this.metaHashToPort[meta.hash].port

  const keyPair = AtekNet.createKeypair() // disposable
  const localPeerNode = new AtekNet.Node(keyPair)

  await this.localRegistry.waitFor(meta) // this is for the first time, can block a while

  const port = await getPort(this.portOptions) // find an open port
  const localPortServer = net.createServer(async (socket) => {
    let conn = undefined
    try {
      const remotePublicKey = this.localRegistry.get(meta)
      conn = await localPeerNode.connect(remotePublicKey)
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
  this.metaHashToPort[meta.hash] = {port, localPortServer, localPeerNode}
  return { host: 'localhost', port }
}
