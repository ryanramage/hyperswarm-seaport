module.exports = function fixMeta (meta, port) {
  if (!meta) return {};
  if (typeof meta === 'string') {
    if (typeof port === 'object') {
      port.role = meta;
      meta = port;
    }
    else meta = { role: meta }
  }
  if (typeof port === 'number') {
    meta.port = port
  }
  if (/@/.test(meta.role)) {
    const parts = meta.role.split('@')
    if (meta.role[0] === '@') {
      meta.version = parts[2]
      meta.role = '@' + parts[1]
    } else {
      meta.version = parts[1]
      meta.role = parts[0]
    }
  }
  return meta
}
