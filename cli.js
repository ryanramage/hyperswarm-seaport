#!/usr/bin/env node
import rc from 'rc'
import fixMeta from './lib/fixMeta.js'
import bind from './lib/bind.js'
import Client from './lib/client.js'
import LocalRegistry from './lib/localRegistry.js'
import RegistryServer from './lib/registryServer.js'
import SimpleMemoryRegistry from './lib/impl/simpleMemoryRegistry.js'
import * as AtekNet from '@atek-cloud/network'
import { toBase32, fromBase32 } from '@atek-cloud/network/dist/util.js'

async function registry () {
  const registry = new SimpleMemoryRegistry()
  const registryServer = new RegistryServer(registry)
  const keyPair = await registryServer.start()
  console.log(`Registry listening. Connect with pubkey ${toBase32(keyPair.publicKey)}`)
}

async function server (registryPubkey, port, roleVersion) {
  if (!port) {
    console.log('running client on cli needs a port specified. use -p <port>')
    process.exit(1)
  }
  const meta = fixMeta(roleVersion)
  await AtekNet.setup()
  const keyPair = AtekNet.createKeypair()
  const publicKey = toBase32(keyPair.publicKey)
  console.log('Created keypair, public key: ', publicKey)
  bind('localhost', port, keyPair)

  const localRegistry = new LocalRegistry(registryPubkey)
  localRegistry.register(meta, publicKey)
  console.log('connected to registry')
}

async function client (registryPubKey, port, roleVersion) {
  const meta = fixMeta(roleVersion)
  const localRegistry = new LocalRegistry(registryPubKey)
  const client = new Client(localRegistry)
  await client.get(meta, port)
  console.log('client connected on ', port)
}

const options = rc('seaport')
const command = options._[0]
const registryPubKey = options._[1]
const port = options.port || options.p
const role = options.role || options.r

if (command === 'server') server(fromBase32(registryPubKey), port, role)
else if (command === 'client') client(fromBase32(registryPubKey), port, role)
else registry()
