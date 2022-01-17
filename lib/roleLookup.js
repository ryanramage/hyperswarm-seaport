import SemverStore from 'semver-store'
import semver from 'semver'

export default class RoleLookup {
  constructor () {
    this.byRole = {}
    this.byId = {}
  }

  add (meta, info) {
    if (!semver.valid(meta.version)) throw new Error('needs to be valid semver')
    if (!info.id) throw new Error('info needs an id property')

    const store = this.byRole[meta.role] || new SemverStore()
    const registrations = store.get(meta.version) || { list: [], set: true }
    if (registrations.set) {
      delete registrations.set
      store.set(meta.version, registrations)
    }
    registrations.list.push({ meta, info })
    this.byRole[meta.role] = store
    this.byId[info.id] = registrations
    return registrations
  }

  get (meta) {
    const notFound = { list: [] }
    const store = this.byRole[meta.role]
    if (!store) return notFound
    const registrations = store.get(meta.version)
    if (!registrations) return notFound
    return registrations
  }

  // remove a registration by id
  remove (id) {
    const registrations = this.byId[id]
    if (!registrations) return
    const index = registrations.list.findIndex(element => {
      if (!element.info) return false
      return element.info.id === id
    })
    if (index < 0) return
    const [details] = registrations.list.splice(index)
    return details
  }
}
