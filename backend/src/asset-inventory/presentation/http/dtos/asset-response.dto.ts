import type { AssetStatus } from '../../../domain/asset-status.js';
import type { AssetType } from '../../../domain/asset-type.js';

export type AssetResponseDto = {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  lat: number;
  lng: number;
  installed_at: string;
  last_inspected_at: string | null;
  notes: string;
};
