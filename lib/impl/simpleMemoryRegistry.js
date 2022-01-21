import semver from 'semver'
import RoleLookup from '../roleLookup.js'
import { toBase32, fromBase32 } from '@atek-cloud/network/dist/util.js'

export default class SimpleMemoryRegistry {
  constructor (opts) {
    this.opts = opts || {}
    this.opts.waitForTimeout = this.opts.waitForTimeout || 15000
    this.opts.waitForExpiryInterval = this.opts.waitForExpiryInterval || 1000

    this.registry = new RoleLookup(true)
    this.servicePublicKeyByRemotePublicKey = {}

    // data structures for waiting on a service to appear
    this.waiting = []
  }

  startWaitingForExpiry () {
    if (this.interval) return // already running
    this.interval = setInterval(() => {
      const now = Date.now()
      this.waiting.forEach((details, i) => {
        if (now < details.expires) return
        if (details.reject) process.nextTick(() => details.reject(new Error('timeout waiting for service')))
        this.waiting.splice(i)
      })
    }, this.opts.waitForExpiryInterval)
  }

  stopWaitingForExpiry () {
    clearInterval(this.interval)
  }

  register (servicePublicKey, remotePublicKey, meta) {
    const registation = { id: servicePublicKey, remotePublicKey, meta }
    this.registry.add(meta, registation)
    const byRemotePublicKey = this.servicePublicKeyByRemotePublicKey[remotePublicKey] || []
    byRemotePublicKey.push(servicePublicKey)
    this.servicePublicKeyByRemotePublicKey[remotePublicKey] = byRemotePublicKey
    console.log('registered service', meta.hash, 'at', servicePublicKey)
    this.checkWaitingFor(meta, registation)
  }

  remove (remotePublicKey) {
    // remove all services associated with this remotePublicKey
    const byRemotePublicKey = this.servicePublicKeyByRemotePublicKey[remotePublicKey] || []
    byRemotePublicKey.forEach(servicePublicKey => {
      this.registry.remove(servicePublicKey)
      // should notify anyone using this to change to another service
    })
    delete this.servicePublicKeyByRemotePublicKey[remotePublicKey]
  }

  checkWaitingFor (meta, registation) {
    this.waiting.forEach((details, i) => {
      if (details.meta.role !== meta.role) return
      if (!semver.satisfies(meta.version, details.meta.version)) return
      if (details.resolve) process.nextTick(() => details.resolve(registation))
      this.waiting.splice(i)
    })
  }

  async waitFor (meta) {
    const details = this.query(meta)
    if (details) return details
    return new Promise((resolve, reject) => {
      const expires = Date.now() + this.opts.waitForTimeout
      this.waiting.push({ resolve, reject, meta, expires })
    })
  }

  query (meta) {
    const registrations = this.registry.get(meta)
    const entry = getRandomIntInclusive(0, registrations.list.length)
    return registrations.list[entry]
  }
}

function getRandomIntInclusive (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min) // The maximum is inclusive and the minimum is inclusive
}
