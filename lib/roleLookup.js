import SemverStore from 'semver-store'
import semver from 'semver'

export default class RoleLookup {
  constructor() {
    this.byRole = {}
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
    registrations.list.push({meta, info})
    this.byRole[meta.role] = store
    return registrations
  }

  get (meta) {
    const notFound = { registrations: [] }
    const store = this.byRole[meta.role]
    if (!store) return notFound
    const registrations = store.get(meta.version)
    if (!registrations) return notFound
    return registrations
  }

  // remove a registration by id
  remove (id) {

  }
}
