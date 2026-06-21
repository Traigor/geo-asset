import { randomUUID } from 'node:crypto';
import {
  AssetNameRequiredError,
  InvalidAssetDateError,
  InvalidAssetStatusError,
  InvalidAssetTypeError,
  LastInspectedBeforeInstalledError,
} from './asset-errors.js';
import { isAssetStatus, type AssetStatus } from './asset-status.js';
import { isAssetType, type AssetType } from './asset-type.js';
import { GeoPoint } from './geo-point.js';
import { LastInspectedAfterInstalledRule } from './rules/last-inspected-after-installed.rule.js';

export type CreateAssetInput = {
  id?: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  lat: number;
  lng: number;
  installedAt: string;
  lastInspectedAt: string | null;
  notes?: string | undefined;
};

export type RehydrateAssetInput = {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  lat: number;
  lng: number;
  installedAt: string;
  lastInspectedAt: string | null;
  notes: string;
};

export type UpdateAssetInput = {
  name?: string;
  type?: AssetType;
  status?: AssetStatus;
  lat?: number;
  lng?: number;
  installedAt?: string;
  lastInspectedAt?: string | null;
  notes?: string;
};

type AssetProps = {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  location: GeoPoint;
  installedAt: string;
  lastInspectedAt: string | null;
  notes: string;
};

export class Asset {
  private constructor(private readonly props: AssetProps) {}

  static create(input: CreateAssetInput): Asset {
    return new Asset({
      id: input.id ?? randomUUID(),
      name: requireNonEmptyName(input.name),
      type: requireAssetType(input.type),
      status: requireAssetStatus(input.status),
      location: GeoPoint.create({ lat: input.lat, lng: input.lng }),
      installedAt: requireDateString(input.installedAt, 'Installed date'),
      lastInspectedAt: requireNullableDateString(input.lastInspectedAt, 'Last inspected date'),
      notes: input.notes ?? '',
    }).validateInspectionDate();
  }

  static rehydrate(input: RehydrateAssetInput): Asset {
    return new Asset({
      id: input.id,
      name: requireNonEmptyName(input.name),
      type: requireAssetType(input.type),
      status: requireAssetStatus(input.status),
      location: GeoPoint.create({ lat: input.lat, lng: input.lng }),
      installedAt: requireDateString(input.installedAt, 'Installed date'),
      lastInspectedAt: requireNullableDateString(input.lastInspectedAt, 'Last inspected date'),
      notes: input.notes,
    }).validateInspectionDate();
  }

  update(input: UpdateAssetInput): Asset {
    const nextLat = input.lat ?? this.props.location.lat;
    const nextLng = input.lng ?? this.props.location.lng;

    return new Asset({
      id: this.props.id,
      name: input.name === undefined ? this.props.name : requireNonEmptyName(input.name),
      type: input.type === undefined ? this.props.type : requireAssetType(input.type),
      status: input.status === undefined ? this.props.status : requireAssetStatus(input.status),
      location: GeoPoint.create({ lat: nextLat, lng: nextLng }),
      installedAt:
        input.installedAt === undefined
          ? this.props.installedAt
          : requireDateString(input.installedAt, 'Installed date'),
      lastInspectedAt:
        input.lastInspectedAt === undefined
          ? this.props.lastInspectedAt
          : requireNullableDateString(input.lastInspectedAt, 'Last inspected date'),
      notes: input.notes ?? this.props.notes,
    }).validateInspectionDate();
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): AssetType {
    return this.props.type;
  }

  get status(): AssetStatus {
    return this.props.status;
  }

  get location(): GeoPoint {
    return this.props.location;
  }

  get installedAt(): string {
    return this.props.installedAt;
  }

  get lastInspectedAt(): string | null {
    return this.props.lastInspectedAt;
  }

  get notes(): string {
    return this.props.notes;
  }

  private validateInspectionDate(): Asset {
    const rule = new LastInspectedAfterInstalledRule(
      this.props.installedAt,
      this.props.lastInspectedAt,
    );

    if (rule.isBroken()) {
      throw new LastInspectedBeforeInstalledError();
    }

    return this;
  }
}

function requireAssetType(type: AssetType): AssetType {
  if (!isAssetType(type)) {
    throw new InvalidAssetTypeError();
  }

  return type;
}

function requireAssetStatus(status: AssetStatus): AssetStatus {
  if (!isAssetStatus(status)) {
    throw new InvalidAssetStatusError();
  }

  return status;
}

function requireNonEmptyName(name: string): string {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    throw new AssetNameRequiredError();
  }

  return trimmed;
}

function requireNullableDateString(value: string | null, label: string): string | null {
  if (value === null) {
    return null;
  }

  return requireDateString(value, label);
}

function requireDateString(value: string, label: string): string {
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateOnlyPattern.test(value)) {
    throw new InvalidAssetDateError(label, 'format');
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new InvalidAssetDateError(label, 'value');
  }

  return value;
}
