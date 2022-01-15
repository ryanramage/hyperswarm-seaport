export default function fixMeta (meta) {
  if (typeof meta === 'string') meta = { role: meta }

  if (/@/.test(meta.role)) {
    const parts = meta.role.split('@')
    if (meta.role[0] === '@') {
      if (!meta.version) meta.version = parts[2]
      meta.role = '@' + parts[1]
    } else {
      meta.version = parts[1]
      meta.role = parts[0]
    }
  }

  meta._tags = {} // we hash the tags
  mata.tags = meta.tags || []
  meta.tags.forEach(tag => _meta.tags = true)

  meta.hash = `${meta.role}|${meta.version}|${Object.keys(meta._tags).join('|')}`

  return meta
}
