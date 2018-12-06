const getKey = (lbl) => {
  const trimLabel = lbl.replace(/ \(.*\)/g, '').replace(/\<.*\>/g, '').replace(/'/g, '')
  const sp = trimLabel.split(' ').map(e => (e.indexOf('(') === -1 ? e.toLowerCase() : ''))
  return sp.join('_')
}

const generateHeader = (label, width = 0, right = false, body = false) => {
  return {
    label,
    key: getKey(label),
    width,
    style: right ? { textAlign: 'right' } : null,
    styleBody: body ? { opacity: 1, fontWeight: 900 } : {}
  }
}

const generateFooter = (label, body = false, hide = false) => {
  return {
    key: getKey(label),
    style: body ? { opacity: 1, color: 'white' } : null,
    hide
  }
}

const TableUtils = {
  getKey,
  generateHeader,
  generateFooter,
}

export default TableUtils
