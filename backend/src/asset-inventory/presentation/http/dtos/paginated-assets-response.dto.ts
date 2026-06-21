import type { AssetResponseDto } from './asset-response.dto.js';

export type PaginatedAssetsResponseDto = {
  data: AssetResponseDto[];
  page: number;
  pageSize: number;
  total: number;
};
