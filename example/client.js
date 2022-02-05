import http from 'http'
import got from 'got'
import Seaport from '../index.js'
import request from 'request'

const pubkey = process.argv[2]
const ports = new Seaport(pubkey)

const {host, port} = await ports.get('web@1.2.x')
request(`http://${host}:${port}`).pipe(process.stdout).on('close', () => {
  console.log('done')
})
