import { useEffect, useState } from 'react';
import {
  assetStatuses,
  assetTypes,
  type AssetFilters as AssetFilterState,
  type AssetStatus,
  type AssetType,
} from '../model/assetTypes';

type AssetFiltersProps = {
  filters: AssetFilterState;
  onChange(filters: AssetFilterState): void;
};

const fieldClass = 'grid gap-1.5 text-sm font-bold text-slate-700';
const selectClass = 'w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-slate-900';

export function AssetFilters({ filters, onChange }: AssetFiltersProps): JSX.Element {
  const [draft, setDraft] = useState<AssetFilterState>(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  return (
    <form
      className="grid gap-3 border-b border-slate-200 px-5 py-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
        <span>Filters</span>
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent p-0 font-bold text-blue-700 hover:text-blue-800"
          onClick={() => {
            const next = resetPanelFilters(draft);
            setDraft(next);
            onChange(next);
          }}
        >
          Clear
        </button>
      </div>

      <label className={fieldClass}>
        Type
        <select
          className={selectClass}
          value={draft.type ?? ''}
          onChange={(event) => {
            updateDraft(draft, setDraft, onChange, 'type', event.target.value);
          }}
        >
          <option value="">All types</option>
          {assetTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <label className={fieldClass}>
        Status
        <select
          className={selectClass}
          value={draft.status ?? ''}
          onChange={(event) => {
            updateDraft(draft, setDraft, onChange, 'status', event.target.value);
          }}
        >
          <option value="">All statuses</option>
          {assetStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}

function updateDraft(
  current: AssetFilterState,
  setDraft: (filters: AssetFilterState) => void,
  onChange: (filters: AssetFilterState) => void,
  field: 'type' | 'status',
  value: string,
): void {
  const next = { ...current };

  if (field === 'type') {
    if (value === '') {
      delete next.type;
    } else {
      next.type = value as AssetType;
    }
  }

  if (field === 'status') {
    if (value === '') {
      delete next.status;
    } else {
      next.status = value as AssetStatus;
    }
  }

  setDraft(next);
  onChange(next);
}

function resetPanelFilters(current: AssetFilterState): AssetFilterState {
  const next = { ...current };
  delete next.type;
  delete next.status;

  return next;
}
