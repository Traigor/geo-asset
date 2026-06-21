import type { AssetStatus } from '../../domain/asset-status.js';
import type { AssetType } from '../../domain/asset-type.js';

export type AssetReadModel = {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  lat: number;
  lng: number;
  installedAt: string;
  lastInspectedAt: string | null;
  notes: string;
};
