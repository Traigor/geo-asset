import type { Request, Response } from 'express';
import type { CreateAssetHandler } from '../../application/command-handlers/create-asset.handler.js';
import type { DeleteAssetHandler } from '../../application/command-handlers/delete-asset.handler.js';
import type { UpdateAssetHandler } from '../../application/command-handlers/update-asset.handler.js';
import type { GetAssetHandler } from '../../application/query-handlers/get-asset.handler.js';
import type { ListAssetsHandler } from '../../application/query-handlers/list-assets.handler.js';
import type { EmptyRequest, ValidatedRequest } from '../../../shared/http/validate-request.js';
import { mapAssetToDto, mapPaginatedAssetsToDto } from './asset.mappers.js';
import {
  toCreateAssetCommand,
  toListAssetsQuery,
  toUpdateAssetCommand,
} from './asset.request-mappers.js';
import type {
  AssetIdParams,
  CreateAssetBody,
  ListAssetsQueryParams,
  UpdateAssetBody,
} from './asset.schemas.js';

export class AssetController {
  constructor(
    private readonly listAssets: ListAssetsHandler,
    private readonly getAsset: GetAssetHandler,
    private readonly createAsset: CreateAssetHandler,
    private readonly updateAsset: UpdateAssetHandler,
    private readonly deleteAsset: DeleteAssetHandler,
  ) {}

  list = async (
    _req: Request,
    res: Response,
    validated: ValidatedRequest<EmptyRequest, ListAssetsQueryParams, EmptyRequest>,
  ): Promise<void> => {
    const result = await this.listAssets.execute(toListAssetsQuery(validated.query));
    res.json(mapPaginatedAssetsToDto(result));
  };

  getById = async (
    _req: Request,
    res: Response,
    validated: ValidatedRequest<AssetIdParams, EmptyRequest, EmptyRequest>,
  ): Promise<void> => {
    const asset = await this.getAsset.execute({ id: validated.params.id });
    res.json(mapAssetToDto(asset));
  };

  create = async (
    _req: Request,
    res: Response,
    validated: ValidatedRequest<EmptyRequest, EmptyRequest, CreateAssetBody>,
  ): Promise<void> => {
    const asset = await this.createAsset.execute(toCreateAssetCommand(validated.body));
    res.status(201).json(mapAssetToDto(asset));
  };

  update = async (
    _req: Request,
    res: Response,
    validated: ValidatedRequest<AssetIdParams, EmptyRequest, UpdateAssetBody>,
  ): Promise<void> => {
    const asset = await this.updateAsset.execute(
      toUpdateAssetCommand(validated.params, validated.body),
    );
    res.json(mapAssetToDto(asset));
  };

  delete = async (
    _req: Request,
    res: Response,
    validated: ValidatedRequest<AssetIdParams, EmptyRequest, EmptyRequest>,
  ): Promise<void> => {
    await this.deleteAsset.execute({ id: validated.params.id });
    res.status(204).send();
  };
}
