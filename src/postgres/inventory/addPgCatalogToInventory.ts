import { Inventory } from '../../interface'
import { PgCatalog } from '../introspection'
import PgCollection from './collection/PgCollection'
import PgRelation from './collection/PgRelation'
import Options from './Options'
import { rewriteActionParser, mapToObject } from '../utils'

/**
 * Adds Postgres based objects created by introspection to an inventory.
 */
export default function addPgCatalogToInventory (
  inventory: Inventory,
  pgCatalog: PgCatalog,
  config: { renameIdToRowId?: boolean } = {},
): void {
  // Turn our config full of optional options, into an options object with the
  // appropriate defaults.
  const options: Options = {
    renameIdToRowId: config.renameIdToRowId || false,
  }

  // We save a reference to all our collections by their class’s id so that we
  // can reference them again later.
  const collectionByClassId = new Map<string, PgCollection>()
  // TODO This will hold all of them, until we improve the introspection query
  // to cover everything refrenceb by views.... or will cross-namespace need
  // some further handling? Or should we just store everything?

  // Add all of our collections. If a class is not selectable, it is probably a
  // compound type and we shouldn’t add a collection for it to our inventory.
  //
  // We also won’t add collection classes if they exist outside a namespace we
  // support.
  for (const pgClass of pgCatalog.getClasses()) {
    if (pgClass.isSelectable && pgCatalog.getNamespace(pgClass.namespaceId)) {
      const collection = new PgCollection(options, pgCatalog, pgClass)
      inventory.addCollection(collection)
      collectionByClassId.set(pgClass.id, collection)
    }
  }

  // Another kind of relations are views containing columns from tables
  // referncing other tables. We basically re-use such existing relations
  // (foreign key contstraints).
  // TODO: Support view recursion (view -> view -> view -> table)
  const classViewReferences = {}
  for (const pgViewRewrite of pgCatalog.getViewRewrites()) {
    // Resolving the rewrite action to a map reflecting what tables/views
    // are being referenced, along with how columns are mapped
    const actionMap = rewriteActionParser.rewriteActionToMap(pgViewRewrite.action)
    const actionObj = mapToObject(actionMap)
    // We have the view and all sources in collectionByClass, at least when
    // the sources are in the same schema
    // TODO verify if applicable for other schemas as well.  We might need
    // to add mechanism to introspection query to introspect namespaces
    // referenced only by views. That should be fun!
    const collView = collectionByClassId.get(pgViewRewrite.class)
    for (const source of actionObj.sources) {
      const ref = {
        aliasName: source.aliasName,
        viewOid: pgViewRewrite.class,
        columns: source.columns,
      }

      if (classViewReferences[source.sourceId] === undefined) {
        classViewReferences[source.sourceId] = [ref]
      } else {
        classViewReferences[source.sourceId].push(ref)
      }
    }
  }

  // Add all of the relations that exist in our database to the inventory. We
  // discover relations by looking at foreign key constraints in Postgres.
  // TODO: This implementation of relations could be better…
  for (const pgConstraint of pgCatalog.getConstraints()) {
    if (pgConstraint.type === 'f') {
      const tailCollection = collectionByClassId.get(pgConstraint.classId)!

      // Here we get the collection key for our foreign table that has the
      // same key attribute numbers we are looking for.
      const headCollectionKey =
        collectionByClassId.get(pgConstraint.foreignClassId)!.keys
          .find(key => {
            const numsA = pgConstraint.foreignKeyAttributeNums
            const numsB = key.pgConstraint.keyAttributeNums

            // Make sure that the length of `numsA` and `numsB` are the same.
            if (numsA.length !== numsB.length) return false

            // Make sure all of the items in `numsA` are also in `numsB` (order
            // does not matter).
            return numsA.reduce((last, num) => last && numsB.indexOf(num) !== -1, true)
          })

      // If no collection key could be found, we need to throw an error.
      if (!headCollectionKey) {
        throw new Error(
          'No primary key or unique constraint found for the column(s) ' +
          `${pgCatalog.getClassAttributes(pgConstraint.foreignClassId, pgConstraint.foreignKeyAttributeNums).map(({ name }) => `'${name}'`).join(', ')} ` +
          'of table ' +
          `'${pgCatalog.assertGetClass(pgConstraint.foreignClassId).name}'. ` +
          'Cannot create a relation without such a constraint. Without this ' +
          'constraint referenced values are not ensured to be unique and ' +
          'lookups may not be performant.',
        )
      }

      inventory.addRelation(new PgRelation(tailCollection, headCollectionKey, pgConstraint))

      // For view references, we look up what views are referencing the tail
      // of the constraint. If that reference makes use of all the columns in
      // the tail number (extra columns don't matter), we add an extra relation
      // with the view instead of the original tail.  PgRelation takes care of
      // the substitution, as it needs the original tail to take care of thing.
      // and add the mutated version to the inventory?
      if (pgConstraint.classId === '789351')
      for (const view of classViewReferences[pgConstraint.classId]) {
        // TODO: Check if the view contains all of the columns used in the relation.
        //       We might event just try and rely on the inventory to verify it, and
        //       if so just ignore such errors?
        // TODO: What if column names don't match? ByFoo if Bar is used...
        inventory.addRelation(new PgRelation(tailCollection, headCollectionKey, pgConstraint,
          collectionByClassId.get(view.viewOid)
        ))
      }
    }
  }
}
