import RoleLookup from '../lib/roleLookup.js'

export default class SimpleMemoryRegistry {
  constructor(opts) {
    this.opts = opts || {}
    this.opts.waitForTimeout = opts.waitForTimeout||15000
    this.opts.waitForExpiryInterval = opts.waitForExpiryInterval || 1000

    this.registry = new RoleLookup()
    this.servicePublicKeyByRemotePublicKey = {}

    // data structures for waiting on a service to appear
    this.waitingFor = new RoleLookup()
    this.waitingForTimeouts = {}
  }

  startWaitingForExpiry () {
    if (this.interval) return // already running
    this.interval = setInterval(() => {
      const now = Date.now()
      Object.keys(this.waitingForTimeouts).forEach(id => {
        if (now < this.waitingForTimeouts[id]) return
        const {reject} = this.waitingFor.remove(id)
        reject(new Error('timeout waiting for service'))
        delete waitingForTimeouts[id]
      })
    }, this.opts.waitForExpiryInterval);
  }

  register (remotePublicKey, servicePublicKey, meta) {
    console.log('register', remotePublicKey, servicePublicKey, meta)
    this.registry.add(meta, {id: servicePublicKey, remotePublicKey, meta})
    const byRemotePublicKey = this.servicePublicKeyByRemotePublicKey[remotePublicKey] || []
    byRemotePublicKey.push(servicePublicKey)
    this.servicePublicKeyByRemotePublicKey[remotePublicKey] = byRemotePublicKey


    this.checkWaitingFor(meta)
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

  checkWaitingFor (meta) {

  }

  async waitFor (meta) {
    let details = query(meta)
    if (details) return details
    return new Promise((resolve, reject) => {
      // create a semi random id for this waiting for item
      const id = tempId()
      this.waitingForTimeouts[id] = Date.now() + this.opts.waitForTimeout
      this.waitingFor.add(meta, {resove, reject, id})
    })
  }

  query (meta) {
    const registrations = registry.get(meta)
    // for now, just return a random entry in the list
    const entry = getRandomIntInclusive(0, registrations.list.length)
    return registrations.list[entry]
  }
}

function tempId () {
    // same as require('scuttlebutt/util').createId()
    return [1,1,1].map(function () {
        return Math.random().toString(16).substring(2).toUpperCase();
    }).join('');
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
