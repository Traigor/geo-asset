import type pg from 'pg';
import { Asset } from '../../domain/asset.js';
import type { AssetReadRepositoryPort } from '../../application/ports/asset-read.repository.port.js';
import type { AssetWriteRepositoryPort } from '../../application/ports/asset-write.repository.port.js';
import type { AssetReadModel } from '../../application/read-models/asset.read-model.js';
import type {
  AssetListCriteria,
  AssetSortField,
  SortDirection,
} from '../../application/types/asset-list-criteria.js';
import type { Paginated } from '../../application/types/paginated.js';
import { toOffset } from '../../../shared/http/pagination.js';
import { toDomain, toPersistence, toReadModel, type AssetRow } from './postgres-asset.mapper.js';

type SqlParam = string | number | null;

const assetColumns = `
  id,
  name,
  type,
  status,
  lat,
  lng,
  installed_at::text AS installed_at,
  last_inspected_at::text AS last_inspected_at,
  notes
`;

export class PostgresAssetReadRepository implements AssetReadRepositoryPort {
  constructor(private readonly db: pg.Pool) {}

  async list(criteria: AssetListCriteria): Promise<Paginated<AssetReadModel>> {
    const where = buildWhereClause(criteria);
    const countResult = await this.db.query<{ total: number }>(
      `SELECT count(*)::int AS total FROM assets ${where.sql}`,
      where.params,
    );
    const total = countResult.rows[0]?.total ?? 0;
    const offset = toOffset({ page: criteria.page, pageSize: criteria.pageSize });
    const listParams: SqlParam[] = [...where.params, criteria.pageSize, offset];
    const limitParam = listParams.length - 1;
    const offsetParam = listParams.length;
    const orderBy = buildOrderByClause(criteria);
    const result = await this.db.query<AssetRow>(
      `
        SELECT ${assetColumns}
        FROM assets
        ${where.sql}
        ${orderBy}
        LIMIT $${limitParam}
        OFFSET $${offsetParam}
      `,
      listParams,
    );

    return {
      data: result.rows.map(toReadModel),
      page: criteria.page,
      pageSize: criteria.pageSize,
      total,
    };
  }

  async findById(id: string): Promise<AssetReadModel | null> {
    const result = await this.db.query<AssetRow>(
      `
        SELECT ${assetColumns}
        FROM assets
        WHERE id = $1
      `,
      [id],
    );
    const row = result.rows[0];
    return row === undefined ? null : toReadModel(row);
  }
}

export class PostgresAssetWriteRepository implements AssetWriteRepositoryPort {
  constructor(private readonly db: pg.Pool) {}

  async findById(id: string): Promise<Asset | null> {
    const result = await this.db.query<AssetRow>(
      `
        SELECT ${assetColumns}
        FROM assets
        WHERE id = $1
      `,
      [id],
    );
    const row = result.rows[0];
    return row === undefined ? null : toDomain(row);
  }

  async create(asset: Asset): Promise<Asset> {
    const result = await this.db.query<AssetRow>(
      `
        INSERT INTO assets (
          id,
          name,
          type,
          status,
          lat,
          lng,
          installed_at,
          last_inspected_at,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING ${assetColumns}
      `,
      assetToParams(asset),
    );
    const row = requireReturnedRow(result);
    return toDomain(row);
  }

  async update(asset: Asset): Promise<Asset> {
    const result = await this.db.query<AssetRow>(
      `
        UPDATE assets
        SET
          name = $2,
          type = $3,
          status = $4,
          lat = $5,
          lng = $6,
          installed_at = $7,
          last_inspected_at = $8,
          notes = $9,
          updated_at = now()
        WHERE id = $1
        RETURNING ${assetColumns}
      `,
      assetToParams(asset),
    );
    const row = requireReturnedRow(result);
    return toDomain(row);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.query('DELETE FROM assets WHERE id = $1', [id]);
    return result.rowCount === 1;
  }
}

function buildOrderByClause(criteria: AssetListCriteria): string {
  const sortField = criteria.sort?.field ?? 'installed_at';
  const sortDirection = criteria.sort?.direction ?? 'desc';
  const column = sortColumnFor(sortField);
  const direction = sortDirectionFor(sortDirection);

  if (sortField === 'last_inspected_at') {
    return `ORDER BY ${column} ${direction} NULLS LAST, id ASC`;
  }

  return `ORDER BY ${column} ${direction}, id ASC`;
}

function sortColumnFor(sortBy: AssetSortField): string {
  const columns: Record<AssetSortField, string> = {
    name: 'lower(name)',
    installed_at: 'installed_at',
    last_inspected_at: 'last_inspected_at',
  };

  return columns[sortBy];
}

function sortDirectionFor(direction: SortDirection): string {
  const directions: Record<SortDirection, string> = {
    asc: 'ASC',
    desc: 'DESC',
  };

  return directions[direction];
}

function buildWhereClause(criteria: AssetListCriteria): { sql: string; params: SqlParam[] } {
  const clauses: string[] = [];
  const params: SqlParam[] = [];

  if (criteria.type !== undefined) {
    params.push(criteria.type);
    clauses.push(`type = $${params.length}`);
  }

  if (criteria.status !== undefined) {
    params.push(criteria.status);
    clauses.push(`status = $${params.length}`);
  }

  if (criteria.geo?.kind === 'radius') {
    params.push(criteria.geo.lng, criteria.geo.lat, criteria.geo.radiusMeters);
    const lngParam = params.length - 2;
    const latParam = params.length - 1;
    const radiusParam = params.length;
    clauses.push(`
      ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint($${lngParam}, $${latParam}), 4326)::geography,
        $${radiusParam}
      )
    `);
  }

  if (criteria.geo?.kind === 'bounds') {
    params.push(criteria.geo.minLat, criteria.geo.maxLat, criteria.geo.minLng, criteria.geo.maxLng);
    const minLatParam = params.length - 3;
    const maxLatParam = params.length - 2;
    const minLngParam = params.length - 1;
    const maxLngParam = params.length;
    clauses.push(
      `lat BETWEEN $${minLatParam} AND $${maxLatParam} AND lng BETWEEN $${minLngParam} AND $${maxLngParam}`,
    );
  }

  return {
    sql: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

function assetToParams(asset: Asset): SqlParam[] {
  const persistence = toPersistence(asset);

  return [
    persistence.id,
    persistence.name,
    persistence.type,
    persistence.status,
    persistence.lat,
    persistence.lng,
    persistence.installedAt,
    persistence.lastInspectedAt,
    persistence.notes,
  ];
}

function requireReturnedRow(result: pg.QueryResult<AssetRow>): AssetRow {
  const row = result.rows[0];

  if (row === undefined) {
    throw new Error('Database did not return asset row');
  }

  return row;
}
