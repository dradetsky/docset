const path = require('path')

const Database = require('better-sqlite3')
const sql = require('sql-bricks-sqlite')

class Docset {
  constructor (dsRoot) {
    this.dsRoot = dsRoot
  }

  get name () {
    return path.basename(this.dsRoot, '.docset')
  }

  get basename () {
    return path.basename(this.dsRoot)
  }

  get plist () {
    return path.join(this.dsRoot, 'Contents/Info.plist')
  }

  get db () {
    return path.join(this.dsRoot, 'Contents/Resources/docSet.dsidx')
  }

  get docRoot () {
    return path.join(this.dsRoot, 'Contents/Resources/Documents')
  }

  getFullPathTo(idxPath) {
    const fullPath = path.join(this.docRoot, idxPath)
    return fullPath
  }

  getRelativePathTo(idxPath) {
    const relPath = path.join(this.basename, idxPath)
    return relPath
  }

  getLinkTo(idxPath) {
    const link = path.join(this.basename, 'Contents/Resources/Documents', idxPath)
    return link
  }
}

class DocsetHandle {
  constructor (docset) {
    this.docset = docset
    this.handle = openHandle(this.docset.db)
  }

  get size () {
    const out = this.query('select count(0) from searchIndex')
    return out[0]['count(0)']
  }

  query (qstr) {
    const stmt = this.handle.prepare(qstr)
    const data = stmt.all()
    return data
  }

  lookupQuery(str) {
    let qry = sql.select().from('searchIndex')
    qry = qry.order(sql('length(name)'))
    qry = qry.order(sql('lower(name)'))
    const pat = likePattern(str)
    qry = qry.where(sql.like('name', pat))
    return qry
  }

  lookup(str) {
    const qry = this.lookupQuery(str)
    return this.query(qry.toString())
  }

  lookupAugmented(str) {
    const irecs = this.lookup(str)
    const arecs = irecs.map(r => this.augment(r))
    return arecs
  }

  augment(idxRec) {
    const augRec = Object.assign({}, idxRec)
    augRec.set = this.docset.name
    augRec.link = this.docset.getLinkTo(augRec.path)
    return augRec
  }
}

function openHandle(target) {
  const h = new Database(target, { readonly: true })
  return h
}

function  likePattern(str) {
  const regex = / +/g
  const out = str.replace(regex, '%')
  return `%${out}%`
}

function makeDocsetConvenienceFn(dsRoot) {
  const ds = new Docset(dsRoot)
  const dh = new DocsetHandle(ds)
  return dh
}

Object.assign(makeDocsetConvenienceFn, {
  DocsetHandle,
  Docset
})

module.exports = makeDocsetConvenienceFn
