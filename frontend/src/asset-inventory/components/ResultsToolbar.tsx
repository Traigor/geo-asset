import type {
  AssetFilters,
  AssetSortBy,
  SortDirection,
} from '../model/assetTypes';

type ResultsToolbarProps = {
  filters: AssetFilters;
  resultLabel: string;
  onChange(filters: AssetFilters): void;
};

type SortOption = {
  label: string;
  value: `${AssetSortBy}:${SortDirection}`;
  sortBy: AssetSortBy;
  sortDirection: SortDirection;
};

const sortOptions: SortOption[] = [
  { label: 'Name A-Z', value: 'name:asc', sortBy: 'name', sortDirection: 'asc' },
  { label: 'Name Z-A', value: 'name:desc', sortBy: 'name', sortDirection: 'desc' },
  {
    label: 'Installed oldest first',
    value: 'installed_at:asc',
    sortBy: 'installed_at',
    sortDirection: 'asc',
  },
  {
    label: 'Installed newest first',
    value: 'installed_at:desc',
    sortBy: 'installed_at',
    sortDirection: 'desc',
  },
  {
    label: 'Inspected oldest first',
    value: 'last_inspected_at:asc',
    sortBy: 'last_inspected_at',
    sortDirection: 'asc',
  },
  {
    label: 'Inspected newest first',
    value: 'last_inspected_at:desc',
    sortBy: 'last_inspected_at',
    sortDirection: 'desc',
  },
];

export function ResultsToolbar({ filters, resultLabel, onChange }: ResultsToolbarProps): JSX.Element {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_190px] items-end gap-x-3 gap-y-2 px-5 pt-3.5">
      <span className="min-w-0 text-sm text-slate-500">{resultLabel}</span>
      <label className="grid w-[190px] justify-self-end gap-1.5 text-right text-sm font-bold text-slate-700">
        Sort
        <select
          className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-slate-900"
          value={sortValue(filters)}
          onChange={(event) => onChange(updateSort(filters, event.target.value))}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {filters.bounds === undefined ? null : (
        <span className="col-span-full inline-flex max-w-full min-w-0 items-center gap-2 justify-self-start rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-sm text-slate-700">
          Map area active
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-0 font-bold text-blue-700 hover:text-blue-800"
            onClick={() => onChange(clearBounds(filters))}
          >
            Clear map area
          </button>
        </span>
      )}
    </div>
  );
}

function sortValue(filters: AssetFilters): SortOption['value'] {
  const sortBy = filters.sortBy ?? 'installed_at';
  const sortDirection = filters.sortDirection ?? 'desc';
  return `${sortBy}:${sortDirection}`;
}

function updateSort(current: AssetFilters, value: string): AssetFilters {
  const selected = sortOptions.find((option) => option.value === value);

  if (selected === undefined) {
    return current;
  }

  return {
    ...current,
    sortBy: selected.sortBy,
    sortDirection: selected.sortDirection,
  };
}

function clearBounds(current: AssetFilters): AssetFilters {
  const next = { ...current };
  delete next.bounds;
  return next;
}
