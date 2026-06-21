import { useEffect, useState } from 'react';
import type { PickedLocation } from '../hooks/useAssets';
import {
  assetStatuses,
  assetTypes,
  type Asset,
  type AssetStatus,
  type AssetType,
  type CreateAssetPayload,
} from '../model/assetTypes';

type AssetFormMode = 'create' | 'edit';

type AssetFormProps = {
  mode: AssetFormMode;
  initialAsset: Asset | null;
  pickedLocation: PickedLocation | null;
  isSubmitting: boolean;
  onSubmit(payload: CreateAssetPayload): void | Promise<void>;
  onCancel(): void;
  onStartPickingLocation(): void;
  onStatusChange(status: AssetStatus): void;
};

type FormState = {
  name: string;
  type: AssetType;
  status: AssetStatus;
  installedAt: string;
  lastInspectedAt: string;
  notes: string;
};

const labelClass = 'grid gap-1.5 text-sm font-bold text-slate-700';
const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-slate-900';
const primaryButtonClass =
  'cursor-pointer rounded-md border border-transparent bg-blue-700 px-3 py-2 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryButtonClass =
  'cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

export function AssetForm({
  mode,
  initialAsset,
  pickedLocation,
  isSubmitting,
  onSubmit,
  onCancel,
  onStartPickingLocation,
  onStatusChange,
}: AssetFormProps): JSX.Element {
  const [form, setForm] = useState<FormState>(() => toInitialForm(initialAsset));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(toInitialForm(initialAsset));
    setError(null);
  }, [initialAsset]);

  const submitLabel = mode === 'create' ? 'Save asset' : 'Save changes';

  return (
    <form
      className="grid gap-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmedName = form.name.trim();

        if (trimmedName.length === 0) {
          setError('Name is required');
          return;
        }

        if (form.installedAt.trim().length === 0) {
          setError('Installed date is required');
          return;
        }

        if (pickedLocation === null) {
          setError('Location is required');
          return;
        }

        setError(null);
        void onSubmit({
          name: trimmedName,
          type: form.type,
          status: form.status,
          lat: pickedLocation.lat,
          lng: pickedLocation.lng,
          installed_at: form.installedAt,
          last_inspected_at: form.lastInspectedAt.trim().length === 0 ? null : form.lastInspectedAt,
          notes: form.notes,
        });
      }}
    >
      {error === null ? null : (
        <p className="mx-0 my-0 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-red-900">
          {error}
        </p>
      )}

      <label className={labelClass}>
        Name
        <input
          className={inputClass}
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </label>

      <label className={labelClass}>
        Type
        <select
          className={inputClass}
          value={form.type}
          onChange={(event) => setForm({ ...form, type: event.target.value as AssetType })}
        >
          {assetTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Status
        <select
          className={inputClass}
          value={form.status}
          onChange={(event) => {
            const status = event.target.value as AssetStatus;
            setForm({ ...form, status });
            onStatusChange(status);
          }}
        >
          {assetStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        Installed at
        <input
          className={inputClass}
          type="date"
          value={form.installedAt}
          onChange={(event) => setForm({ ...form, installedAt: event.target.value })}
        />
      </label>

      <label className={labelClass}>
        Last inspected at
        <input
          className={inputClass}
          type="date"
          value={form.lastInspectedAt}
          onChange={(event) => setForm({ ...form, lastInspectedAt: event.target.value })}
        />
      </label>

      <label className={labelClass}>
        Notes
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
        />
      </label>

      <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-2.5">
        <span className="min-w-0 text-sm break-words text-slate-700 [overflow-wrap:anywhere]">
          {pickedLocation === null
            ? 'No location selected'
            : `${pickedLocation.lat.toFixed(6)}, ${pickedLocation.lng.toFixed(6)}`}
        </span>
       <button
          type="button"
          className={secondaryButtonClass}
          disabled={isSubmitting}
          onClick={onStartPickingLocation}
        >
          Pick location
        </button>
      </div>

      <button type="submit" className={primaryButtonClass} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
      <button
        type="button"
        className={secondaryButtonClass}
        disabled={isSubmitting}
        onClick={onCancel}
      >
        Cancel
      </button>
    </form>
  );
}

function toInitialForm(asset: Asset | null): FormState {
  return {
    name: asset?.name ?? '',
    type: asset?.type ?? 'pipe',
    status: asset?.status ?? 'ok',
    installedAt: asset?.installed_at ?? '',
    lastInspectedAt: asset?.last_inspected_at ?? '',
    notes: asset?.notes ?? '',
  };
}
