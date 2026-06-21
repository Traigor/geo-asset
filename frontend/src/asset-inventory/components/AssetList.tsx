import { EmptyState } from '../../shared/components/EmptyState';
import { LoadingState } from '../../shared/components/LoadingState';
import { cn } from '../../shared/ui/classNames';
import type { Asset, AssetStatus } from '../model/assetTypes';

type AssetListProps = {
  assets: Asset[];
  selectedAssetId: string | undefined;
  isLoading: boolean;
  onSelect(asset: Asset): void;
};

const statusClasses: Record<AssetStatus, string> = {
  ok: 'bg-green-700',
  warning: 'bg-orange-600',
  critical: 'bg-red-700',
};

export function AssetList({
  assets,
  selectedAssetId,
  isLoading,
  onSelect,
}: AssetListProps): JSX.Element {
  if (isLoading) {
    return <LoadingState label="Loading assets" />;
  }

  if (assets.length === 0) {
    return <EmptyState message="No assets found" />;
  }

  return (
    <ul className="grid list-none gap-2 p-5" aria-label="Assets">
      {assets.map((asset) => (
        <li key={asset.id}>
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-2.5 text-left hover:border-slate-300 hover:bg-slate-50',
              asset.id === selectedAssetId && 'border-blue-700 ring-2 ring-blue-700/20',
            )}
            onClick={() => onSelect(asset)}
          >
            <span className="grid min-w-0 gap-1">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap font-bold">
                {asset.name}
              </span>
              <span className="text-xs text-slate-500">
                {asset.type} · {asset.last_inspected_at ?? 'not inspected'}
              </span>
            </span>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-1 text-xs leading-none text-white',
                statusClasses[asset.status],
              )}
            >
              {asset.status}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
