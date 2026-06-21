export const assetTypes = ['pipe', 'hydrant', 'sensor', 'valve'] as const;

export type AssetType = (typeof assetTypes)[number];

const assetTypeValues: readonly string[] = assetTypes;

export function isAssetType(value: string): value is AssetType {
  return assetTypeValues.includes(value);
}
