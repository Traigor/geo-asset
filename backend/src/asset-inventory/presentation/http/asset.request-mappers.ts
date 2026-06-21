import type { CreateAssetCommand } from '../../application/commands/create-asset.command.js';
import type { UpdateAssetCommand } from '../../application/commands/update-asset.command.js';
import type { ListAssetsQuery } from '../../application/queries/list-assets.query.js';
import type {
  AssetIdParams,
  CreateAssetBody,
  ListAssetsQueryParams,
  UpdateAssetBody,
} from './asset.schemas.js';

export function toListAssetsQuery(query: ListAssetsQueryParams): ListAssetsQuery {
  const mapped: ListAssetsQuery = {
    page: query.page,
    pageSize: query.pageSize,
    sort: {
      field: query.sortBy,
      direction: query.sortDirection,
    },
  };

  if (query.type !== undefined) mapped.type = query.type;
  if (query.status !== undefined) mapped.status = query.status;

  if (
    query.nearLat !== undefined &&
    query.nearLng !== undefined &&
    query.radiusMeters !== undefined
  ) {
    mapped.geo = {
      kind: 'radius',
      lat: query.nearLat,
      lng: query.nearLng,
      radiusMeters: query.radiusMeters,
    };
  }

  if (
    query.minLat !== undefined &&
    query.minLng !== undefined &&
    query.maxLat !== undefined &&
    query.maxLng !== undefined
  ) {
    mapped.geo = {
      kind: 'bounds',
      minLat: query.minLat,
      minLng: query.minLng,
      maxLat: query.maxLat,
      maxLng: query.maxLng,
    };
  }

  return mapped;
}

export function toCreateAssetCommand(body: CreateAssetBody): CreateAssetCommand {
  return {
    name: body.name,
    type: body.type,
    status: body.status,
    lat: body.lat,
    lng: body.lng,
    installedAt: body.installed_at,
    lastInspectedAt: body.last_inspected_at,
    notes: body.notes,
  };
}

export function toUpdateAssetCommand(
  params: AssetIdParams,
  body: UpdateAssetBody,
): UpdateAssetCommand {
  const command: UpdateAssetCommand = { id: params.id };

  if (body.name !== undefined) command.name = body.name;
  if (body.type !== undefined) command.type = body.type;
  if (body.status !== undefined) command.status = body.status;
  if (body.lat !== undefined) command.lat = body.lat;
  if (body.lng !== undefined) command.lng = body.lng;
  if (body.installed_at !== undefined) command.installedAt = body.installed_at;
  if (body.last_inspected_at !== undefined) command.lastInspectedAt = body.last_inspected_at;
  if (body.notes !== undefined) command.notes = body.notes;

  return command;
}
