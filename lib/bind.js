import net from 'net'
import * as AtekNet from '@atek-cloud/network'
import { fromBase32, toBase32 } from '@atek-cloud/network/dist/util.js'
import pump from 'pump'

async function bind (host, port) {
  await AtekNet.setup()
  const keyPair = AtekNet.createKeypair()
  console.log('Created temporary keypair, public key:', toBase32(keyPair.publicKey))
  const node = new AtekNet.Node(keyPair)

  await node.listen()
  node.on('connection', sock => {
    console.log('CONNECT pubkey:', sock.remotePublicKeyB32)
    sock.on('close', () => {
      console.log('CLOSE pubkey:', sock.remotePublicKeyB32)
    })
  })
  node.setProtocolHandler((stream) => {
    const conn = net.connect({host, port})
    pump(stream, conn, stream)
  })
}

export {bind}
