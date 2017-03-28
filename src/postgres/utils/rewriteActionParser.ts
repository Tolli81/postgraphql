/**
 * Parses rewrite actions into an ES6 map.
 */

namespace rewriteActionParser {

  const _ = require('lodash')
  const regexKVPairs = /\s*:([a-z]+) (\S+)\s*/g

  /**
   * Take an array of [key1, val1, key2, val2, ...] and return as a hash
   */
  export function mixToHash (arr: Array<T>): {} {
    let ret = {}
    for (const i = 0; i < arr.length; i++) {
      ret[arr[i]] = arr[++i]
    }
    return ret
  }

  /**
   * This code will probably fail when column names contain braces or quotes
   */
  export function rewriteActionToMap (action: string): Array<Map<string, mixed>> {
    const obj = {
      rtes: [],
      targetEntries: [],
    }

    // Extract all the "RTE" chunks and iterate over them
    const rtes = action.split(/(RTE.*?})(?: {|\))/).filter(Boolean).slice(1, -1)
    for (const val of rtes) {
      const elems = mixToHash(val.split(/:(\S+) ((?:\(.*?\)|\S+|[0-9]))?}*\s*/g).filter(Boolean).slice(1))
      elems.colnamesArr = elems.colnames.split(/\"(.*?)\"\s*/).filter(Boolean).slice(1, -1)
      obj.rtes.push(elems)
    }

    // Extract all the "TARGETENTRY" chunks and iterate over them
    const targetEntries = action.split(/({TARGETENTRY.*?}.*?})/)
    for (const val of targetEntries) {
      // Now extract the key/value pair (in ":key val" format) lists,
      // as they're two the resulting array will have a length of 4
      const sets = val.split(/{TARGETENTRY.*?VAR(.*?)}(.*?)}/)
      if (sets.length === 4) {
        // Finally extract the key/value pairs (in ":key val" format),
        obj.targetEntries.push({
            // first from what's withing the VAR section
          vars: mixToHash(sets[1].split(regexKVPairs).filter(Boolean)),
            // ... and then what comes after
          after: mixToHash(sets[2].split(regexKVPairs).filter(Boolean)),
        })
      }
    }

    const ret = {
      sources: [],
    }
    for (const rte of _.filter(obj.rtes, { relkind: 'r' })) {
      const source = {
        aliasName: rte.aliasname,
        sourceId: rte.relid,
        columns: {},
      }
      const te = _.filter(obj.targetEntries, (item) => { return item.after.resorigtbl === rte.relid } )
      for (const entry of te) {
        source.columns[entry.after.resname] = rte.colnamesArr[entry.after.resorigcol - 1]
/*
          source.columns.push({
              sourceColumnName: entry.after.resname,
              targetColumnName: rte.colnamesArr[entry.after.resorigcol-1],
              targetColumnIdx: entry.after.resorigcol
          })
*/
      }
      ret.sources.push(source)
    }

    return ret
  }
}

export default rewriteActionParser
