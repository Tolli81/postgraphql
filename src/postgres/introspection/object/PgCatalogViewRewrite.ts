/**
 * A view rewrite provides information about target table/column of columns in a view
 *
 * @see https://www.postgresql.org/docs/9.6/static/catalog-pg-rewrite.html
 */
interface PgCatalogViewRewrite {
  readonly kind: 'viewrewrite'
  readonly id: string
  readonly class: string
  readonly action: string
}

export default PgCatalogViewRewrite
