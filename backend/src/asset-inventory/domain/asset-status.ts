export const assetStatuses = ['ok', 'warning', 'critical'] as const;

export type AssetStatus = (typeof assetStatuses)[number];

const assetStatusValues: readonly string[] = assetStatuses;

export function isAssetStatus(value: string): value is AssetStatus {
  return assetStatusValues.includes(value);
}
