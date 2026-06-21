import { useEffect, useState } from 'react';
import { AssetDrawer } from '../components/AssetDrawer';
import { AssetFilters } from '../components/AssetFilters';
import { AssetList } from '../components/AssetList';
import { AssetMap } from '../components/AssetMap';
import { ResultsToolbar } from '../components/ResultsToolbar';
import { useAssets } from '../hooks/useAssets';
import type {
  AssetFilters as AssetFilterState,
  AssetStatus,
  BoundsFilter,
} from '../model/assetTypes';

const primaryButtonClass =
  'cursor-pointer rounded-md border border-transparent bg-blue-700 px-3 py-2 text-white hover:bg-blue-800';
const secondaryButtonClass =
  'cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

export function AssetInventoryPage(): JSX.Element {
  const assetState = useAssets();
  const [draftAssetStatus, setDraftAssetStatus] = useState<AssetStatus>('ok');
  const paginationLabel = formatPaginationLabel({
    itemCount: assetState.assets.length,
    page: assetState.page,
    pageSize: assetState.pageSize,
    total: assetState.total,
  });

  useEffect(() => {
    if (assetState.drawerMode === 'create') {
      setDraftAssetStatus('ok');
      return;
    }

    if (assetState.drawerMode === 'edit' && assetState.selectedAsset !== null) {
      setDraftAssetStatus(assetState.selectedAsset.status);
    }
  }, [assetState.drawerMode, assetState.selectedAsset]);

  return (
    <main className="grid h-screen min-h-[640px] grid-cols-[380px_minmax(0,1fr)]">
      <section className="min-w-0 overflow-auto border-r border-slate-200 bg-white">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
          <h1 className="m-0 text-[22px] leading-tight font-bold">Asset Inventory</h1>
          <button type="button" className={primaryButtonClass} onClick={assetState.openCreate}>
            New asset
          </button>
        </header>
        <AssetFilters filters={assetState.filters} onChange={assetState.setFilters} />
        {assetState.error === null ? null : (
          <p className="mx-5 my-3 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-red-900">
            {assetState.error}
          </p>
        )}
        <ResultsToolbar
          filters={assetState.filters}
          resultLabel={paginationLabel}
          onChange={assetState.setFilters}
        />
        <AssetList
          assets={assetState.assets}
          selectedAssetId={assetState.selectedAsset?.id}
          isLoading={assetState.isLoading}
          onSelect={assetState.selectAsset}
        />
        <footer className="flex items-center justify-end gap-2 px-5 pt-3 pb-5">
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={assetState.page <= 1}
            onClick={() => assetState.setPage(assetState.page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={assetState.page * assetState.pageSize >= assetState.total}
            onClick={() => assetState.setPage(assetState.page + 1)}
          >
            Next
          </button>
        </footer>
      </section>
      <AssetMap
        assets={assetState.assets}
        selectedAsset={assetState.selectedAsset}
        selectedAssetId={assetState.selectedAsset?.id}
        isPickingLocation={assetState.isPickingLocation}
        fitAssets={assetState.filters.bounds === undefined}
        pickedLocationPreview={
          assetState.isPickedLocationPreviewVisible && assetState.pickedLocation !== null
            ? {
                lat: assetState.pickedLocation.lat,
                lng: assetState.pickedLocation.lng,
                status: draftAssetStatus,
              }
            : null
        }
        onSelectAsset={assetState.selectAsset}
        onPickLocation={assetState.pickLocation}
        onSearchArea={(bounds) => assetState.setFilters(applyMapBounds(assetState.filters, bounds))}
      />
      <AssetDrawer
        mode={assetState.drawerMode}
        asset={assetState.selectedAsset}
        pickedLocation={assetState.pickedLocation}
        mutationError={assetState.mutationError}
        isMutating={assetState.isMutating}
        onClose={assetState.closeDrawer}
        onEdit={assetState.openEdit}
        onDelete={assetState.deleteAsset}
        onCreate={assetState.createAsset}
        onUpdate={assetState.updateAsset}
        onStartPickingLocation={assetState.startPickingLocation}
        onDraftStatusChange={setDraftAssetStatus}
      />
    </main>
  );
}

function applyMapBounds(filters: AssetFilterState, bounds: BoundsFilter): AssetFilterState {
  const next = { ...filters, bounds };
  delete next.near;
  return next;
}

type PaginationLabelInput = {
  itemCount: number;
  page: number;
  pageSize: number;
  total: number;
};

function formatPaginationLabel({ itemCount, page, pageSize, total }: PaginationLabelInput): string {
  if (total === 0 || itemCount === 0) {
    return `0 of ${total}`;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(start + itemCount - 1, total);
  return `${start}-${end} of ${total}`;
}
