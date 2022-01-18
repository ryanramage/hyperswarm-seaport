import net from 'net'
import * as AtekNet from '@atek-cloud/network'
import { toBase32 } from '@atek-cloud/network/dist/util.js'
import pump from 'pump'

export default async function bind (host, port, keyPair) {
  const node = new AtekNet.Node(keyPair)

  await node.listen()
  node.on('connection', sock => {
    console.log('CONNECT pubkey:', sock.remotePublicKeyB32)
    sock.on('close', () => {
      console.log('CLOSE pubkey:', sock.remotePublicKeyB32)
    })
  })
  node.setProtocolHandler((stream) => {
    const conn = net.connect({ host, port })
    pump(stream, conn, stream)
  })
}
