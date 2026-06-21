import type { CreateAssetRequestDto } from './create-asset-request.dto.js';

export type UpdateAssetRequestDto = {
  [Key in keyof CreateAssetRequestDto]?: CreateAssetRequestDto[Key] | undefined;
};
