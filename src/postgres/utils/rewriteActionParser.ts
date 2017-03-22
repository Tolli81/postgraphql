/**
 * Parses rewrite actions into an ES6 map.
 */

namespace rewriteActionParser {

  const regexTargetEntries = /({TARGETENTRY.*?VAR.*?}.*?})/
  const regexTargetEntryLists = /{TARGETENTRY.*?VAR(.*?)}(.*?)}/
  const regexKVPairs = /\s*:([a-z]+) (\S+)\s*/g

  /**
   * Take an array of [key1, val1, key2, val2, ...] and return as a hash
   */
  function mixToHash (arr: Array<T>): {} {
    let ret = {}
    for (const i = 0; i < arr.length; i++) {
      ret[arr[i]] = arr[++i]
    }
    return ret
  }

  export function rewriteActionToMap (action: string): Array<Map<string, mixed>> {
    const arr = []

    // Extract all the "TARGETENTRY" chunks and iterate over them
    const targetEntries = action.split(regexTargetEntries)
    for (const val of targetEntries) {
      // Now extract the key/value pair (in ":key val" format) lists,
      // as they're two the resulting array will have a length of 4
      const sets = val.split(regexTargetEntryLists)
      if (sets.length === 4) {
        const map = new Map<string, mixed>()
        // Finally extract the key/value pairs (in ":key val" format),
        // first from what's withing the VAR section
        map.set('vars', mixToHash(sets[1].split(regexKVPairs).filter(Boolean)))
        // ... and then what comes after
        map.set('after', mixToHash(sets[2].split(regexKVPairs).filter(Boolean)))
        arr.push(map)
      }
    }

    return arr
  }
}

export default rewriteActionParser
