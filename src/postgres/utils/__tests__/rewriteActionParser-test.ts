/* tslint:disable no-any */

import objectToMap from '../objectToMap'
import rewriteActionParser from '../rewriteActionParser'

test('mixToHash will return proper key/val hash', () => {
  const mix = ['key1', 'val1', 'key2', 'val2']
  expect(rewriteActionParser.mixToHash(mix)).toEqual({ key1: 'val1', key2: 'val2' })
})

test('mixToHash will return proper key/val hash', () => {
  const action = '({QUERY :commandType 1 :querySource 0 :canSetTag true :utilityStmt <> :resultRelation 0 :hasAggs false :hasWindowFuncs false :hasSubLinks false :hasDistinctOn false :hasRecursive false :hasModifyingCTE false :hasForUpdate false :hasRowSecurity false :cteList <> :rtable ({RTE :alias {ALIAS :aliasname old :colnames <>} :eref {ALIAS :aliasname old :colnames ("v1_t1c4" "v1_t1c3" "v1_t1c2" "v1_t1c1" "foo" "v1_t2c4" "v1_t2c3" "v1_t2c2" "v1_t2c1")} :rtekind 0 :relid 501466 :relkind v :tablesample <> :lateral false :inh false :inFromCl false :requiredPerms 0 :checkAsUser 0 :selectedCols (b) :insertedCols (b) :updatedCols (b) :securityQuals <>} {RTE :alias {ALIAS :aliasname new :colnames <>} :eref {ALIAS :aliasname new :colnames ("v1_t1c4" "v1_t1c3" "v1_t1c2" "v1_t1c1" "foo" "v1_t2c4" "v1_t2c3" "v1_t2c2" "v1_t2c1")} :rtekind 0 :relid 501466 :relkind v :tablesample <> :lateral false :inh false :inFromCl false :requiredPerms 0 :checkAsUser 0 :selectedCols (b) :insertedCols (b) :updatedCols (b) :securityQuals <>} {RTE :alias <> :eref {ALIAS :aliasname t1 :colnames ("t1c1" "t1c2" "t1c3" "t1c4")} :rtekind 0 :relid 433496 :relkind r :tablesample <> :lateral false :inh true :inFromCl true :requiredPerms 2 :checkAsUser 0 :selectedCols (b 9 10 11 12) :insertedCols (b) :updatedCols (b) :securityQuals <>} {RTE :alias <> :eref {ALIAS :aliasname t2 :colnames ("t2c1" "t2c2" "t2c3" "t2c4")} :rtekind 0 :relid 433499 :relkind r :tablesample <> :lateral false :inh true :inFromCl true :requiredPerms 2 :checkAsUser 0 :selectedCols (b 9 10 11 12) :insertedCols (b) :updatedCols (b) :securityQuals <>}) :jointree {FROMEXPR :fromlist ({RANGETBLREF :rtindex 3} {RANGETBLREF :rtindex 4}) :quals <>} :targetList ({TARGETENTRY :expr {VAR :varno 3 :varattno 4 :vartype 23 :vartypmod -1 :varcollid 0 :varlevelsup 0 :varnoold 3 :varoattno 4 :location 31} :resno 1 :resname v1_t1c4 :ressortgroupref 0 :resorigtbl 433496 :resorigcol 4 :resjunk false} {TARGETENTRY :expr {VAR :varno 3 :varattno 3 :vartype 23 :vartypmod -1 :varcollid 0 :varlevelsup 0 :varnoold 3 :varoattno 3 :location 51} :resno 2 :resname v1_t1c3 :ressortgroupref 0 :resorigtbl 433496 :resorigcol 3 :resjunk false} {TARGETENTRY :expr {VAR :varno 3 :varattno 2 :vartype 23 :vartypmod -1 :varcollid 0 :varlevelsup 0 :varnoold 3 :varoattno 2 :location 71} :resno 3 :resname v1_t1c2 :ressortgroupref 0 :resorigtbl 433496 :resorigcol 2 :resjunk false} {TARGETENTRY :expr {VAR :varno 3 :varattno 1 :vartype 23 :vartypmod -1 :varcollid 0 :varlevelsup 0 :varnoold 3 :varoattno 1 :location 91} :resno 4 :resname v1_t1c1 :ressortgroupref 0 :resorigtbl 433496 :resorigcol 1 :resjunk false} {TARGETENTRY :expr {CONST :consttype 1043 :consttypmod -1 :constcollid 100 :constlen -1 :constbyval false :constisnull false :location 112 :constvalue 7 [ 28 0 0 0 102 111 111 ]} :resno 5 :resname foo :ressortgroupref 0 :resorigtbl 0 :resorigcol 0 :resjunk false} {TARGETENTRY :expr {VAR :varno 4 :varattno 4 :vartype 23 :vartypmod -1 :varcollid 0 :varlevelsup 0 :varnoold 4 :varoattno 4 :location 136} :resno 6 :resname v1_t2c4 :ressortgroupref 0 :resorigtbl 433499 :resorigcol 4 :resjunk false} {TARGETENTRY :expr {VAR :varno 4 :varattno 3 :vartype 23 :vartypmod -1 :varcollid 0 :varlevelsup 0 :varnoold 4 :varoattno 3 :location 156} :resno 7 :resname v1_t2c3 :ressortgroupref 0 :resorigtbl 433499 :resorigcol 3 :resjunk false} {TARGETENTRY :expr {VAR :varno 4 :varattno 2 :vartype 23 :vartypmod -1 :varcollid 0 :varlevelsup 0 :varnoold 4 :varoattno 2 :location 176} :resno 8 :resname v1_t2c2 :ressortgroupref 0 :resorigtbl 433499 :resorigcol 2 :resjunk false} {TARGETENTRY :expr {VAR :varno 4 :varattno 1 :vartype 23 :vartypmod -1 :varcollid 0 :varlevelsup 0 :varnoold 4 :varoattno 1 :location 196} :resno 9 :resname v1_t2c1 :ressortgroupref 0 :resorigtbl 433499 :resorigcol 1 :resjunk false}) :onConflict <> :returningList <> :groupClause <> :groupingSets <> :havingQual <> :windowClause <> :distinctClause <> :sortClause <> :limitOffset <> :limitCount <> :rowMarks <> :setOperations <> :constraintDeps <>})'
  expect(rewriteActionParser.rewriteActionToMap(action)).toEqual(objectToMap({
    sources: [
      {
        aliasName: 't1',
        sourceId: '433496',
        columns: {
          'v1_t1c4': 't1c4',
          'v1_t1c3': 't1c3',
          'v1_t1c2': 't1c2',
          'v1_t1c1': 't1c1',
        },
      },
      {
        aliasName: 't2',
        sourceId: '433499',
        columns: {
          'v1_t2c4': 't2c4',
          'v1_t2c3': 't2c3',
          'v1_t2c2': 't2c2',
          'v1_t2c1': 't2c1',
        },
      },
    ]}))

})
