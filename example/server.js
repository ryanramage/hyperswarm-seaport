import http from 'http'

import Seaport from '../index.js'

const pubkey = process.argv[2]

const ports = new Seaport(pubkey)
const server = http.createServer((req, res) => res.end('beep boop\r\n'))
server.listen(await ports.register('web@1.2.3'))
