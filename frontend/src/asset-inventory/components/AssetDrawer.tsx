import { Drawer } from '../../shared/components/Drawer';
import type { DrawerMode, PickedLocation } from '../hooks/useAssets';
import type { Asset, AssetStatus, CreateAssetPayload } from '../model/assetTypes';
import { AssetForm } from './AssetForm';

type AssetDrawerProps = {
  mode: DrawerMode;
  asset: Asset | null;
  pickedLocation: PickedLocation | null;
  mutationError: string | null;
  isMutating: boolean;
  onClose(): void;
  onEdit(asset: Asset): void;
  onDelete(id: string): Promise<void>;
  onCreate(payload: CreateAssetPayload): Promise<void>;
  onUpdate(id: string, payload: CreateAssetPayload): Promise<void>;
  onStartPickingLocation(): void;
  onDraftStatusChange(status: AssetStatus): void;
};

const primaryButtonClass =
  'cursor-pointer rounded-md border border-transparent bg-blue-700 px-3 py-2 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50';
const dangerButtonClass =
  'cursor-pointer rounded-md border border-transparent bg-red-700 px-3 py-2 text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50';

export function AssetDrawer({
  mode,
  asset,
  pickedLocation,
  mutationError,
  isMutating,
  onClose,
  onEdit,
  onDelete,
  onCreate,
  onUpdate,
  onStartPickingLocation,
  onDraftStatusChange,
}: AssetDrawerProps): JSX.Element | null {
  const isOpen = mode !== 'closed';
  const title = mode === 'create' ? 'New asset' : asset?.name ?? 'Asset';

  return (
    <Drawer title={title} isOpen={isOpen} onClose={onClose}>
      {mutationError === null ? null : (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-red-900">
          {mutationError.split('\n').map((line) => (
            <p key={line} className="m-0">
              {line}
            </p>
          ))}
        </div>
      )}
      {mode === 'details' && asset !== null ? (
        <AssetDetails asset={asset} isMutating={isMutating} onEdit={onEdit} onDelete={onDelete} />
      ) : null}

      {mode === 'create' ? (
       <AssetForm
          mode="create"
          initialAsset={null}
          pickedLocation={pickedLocation}
          isSubmitting={isMutating}
          onSubmit={onCreate}
          onCancel={onClose}
          onStartPickingLocation={onStartPickingLocation}
          onStatusChange={onDraftStatusChange}
        />
      ) : null}

      {mode === 'edit' && asset !== null ? (
        <AssetForm
          mode="edit"
          initialAsset={asset}
          pickedLocation={pickedLocation}
          isSubmitting={isMutating}
          onSubmit={(payload) => onUpdate(asset.id, payload)}
          onCancel={onClose}
          onStartPickingLocation={onStartPickingLocation}
          onStatusChange={onDraftStatusChange}
        />
      ) : null}
    </Drawer>
  );
}

type AssetDetailsProps = {
  asset: Asset;
  isMutating: boolean;
  onEdit(asset: Asset): void;
  onDelete(id: string): Promise<void>;
};

function AssetDetails({ asset, isMutating, onEdit, onDelete }: AssetDetailsProps): JSX.Element {
  const handleDelete = (): void => {
    const confirmed = window.confirm(
      `Delete "${asset.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    void onDelete(asset.id);
  };

  return (
    <div>
      <dl className="grid gap-3">
        <div className="grid gap-1">
          <dt className="text-xs font-bold tracking-normal text-slate-500 uppercase">Type</dt>
          <dd className="m-0 text-slate-900">{asset.type}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs font-bold tracking-normal text-slate-500 uppercase">Status</dt>
          <dd className="m-0 text-slate-900">{asset.status}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs font-bold tracking-normal text-slate-500 uppercase">Location</dt>
          <dd className="m-0 text-slate-900">
            {asset.lat.toFixed(6)}, {asset.lng.toFixed(6)}
          </dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs font-bold tracking-normal text-slate-500 uppercase">Installed</dt>
          <dd className="m-0 text-slate-900">{asset.installed_at}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs font-bold tracking-normal text-slate-500 uppercase">
            Last inspected
          </dt>
          <dd className="m-0 text-slate-900">{asset.last_inspected_at ?? 'not inspected'}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-xs font-bold tracking-normal text-slate-500 uppercase">Notes</dt>
          <dd className="m-0 text-slate-900">{asset.notes.length === 0 ? 'none' : asset.notes}</dd>
        </div>
      </dl>
      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          className={primaryButtonClass}
          disabled={isMutating}
          onClick={() => onEdit(asset)}
        >
          Edit
        </button>
        <button
          type="button"
          className={dangerButtonClass}
          disabled={isMutating}
          onClick={handleDelete}
        >
          {isMutating ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
