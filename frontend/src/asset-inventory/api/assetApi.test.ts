import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAsset, listAssets, updateAsset } from './assetApi';

const fetchMock = vi.fn<typeof fetch>();

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('assetApi', () => {
  it('serializes list filters and radius query parameters', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [], page: 1, pageSize: 50, total: 0 }));
    vi.stubGlobal('fetch', fetchMock);

    await listAssets({
      page: 1,
      pageSize: 50,
      type: 'sensor',
      status: 'warning',
      sortBy: 'name',
      sortDirection: 'desc',
      near: { lat: 42.36, lng: -71.06, radiusMeters: 5000 },
    });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));

    expect(url.pathname).toBe('/api/assets');
    expect(url.searchParams.get('type')).toBe('sensor');
    expect(url.searchParams.get('status')).toBe('warning');
    expect(url.searchParams.get('sortBy')).toBe('name');
    expect(url.searchParams.get('sortDirection')).toBe('desc');
    expect(url.searchParams.get('nearLat')).toBe('42.36');
    expect(url.searchParams.get('nearLng')).toBe('-71.06');
    expect(url.searchParams.get('radiusMeters')).toBe('5000');
  });

  it('serializes map bounds query parameters', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [], page: 1, pageSize: 50, total: 0 }));
    vi.stubGlobal('fetch', fetchMock);

    await listAssets({
      page: 1,
      pageSize: 50,
      bounds: { minLat: 40, minLng: -75, maxLat: 45, maxLng: -70 },
    });

    const url = new URL(String(fetchMock.mock.calls[0]?.[0]));

    expect(url.searchParams.get('minLat')).toBe('40');
    expect(url.searchParams.get('minLng')).toBe('-75');
    expect(url.searchParams.get('maxLat')).toBe('45');
    expect(url.searchParams.get('maxLng')).toBe('-70');
  });

  it('sends create payloads with snake_case date fields', async () => {
    fetchMock.mockResolvedValue(jsonResponse(assetFixture));
    vi.stubGlobal('fetch', fetchMock);

    await createAsset({
      name: 'Sensor S-0001',
      type: 'sensor',
      status: 'ok',
      lat: 42.36,
      lng: -71.06,
      installed_at: '2020-01-10',
      last_inspected_at: null,
      notes: '',
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(init.method).toBe('POST');
    expect(init.body).toBe(
      JSON.stringify({
        name: 'Sensor S-0001',
        type: 'sensor',
        status: 'ok',
        lat: 42.36,
        lng: -71.06,
        installed_at: '2020-01-10',
        last_inspected_at: null,
        notes: '',
      }),
    );
  });

  it('sends update payloads with snake_case date fields', async () => {
    fetchMock.mockResolvedValue(jsonResponse(assetFixture));
    vi.stubGlobal('fetch', fetchMock);

    await updateAsset('17fc695a-07a0-4a6e-8822-e8f36c031199', {
      last_inspected_at: '2024-01-10',
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(init.method).toBe('PATCH');
    expect(init.body).toBe(JSON.stringify({ last_inspected_at: '2024-01-10' }));
  });
});

const assetFixture = {
  id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
  name: 'Sensor S-0001',
  type: 'sensor',
  status: 'ok',
  lat: 42.36,
  lng: -71.06,
  installed_at: '2020-01-10',
  last_inspected_at: null,
  notes: '',
} as const;

function jsonResponse(body: object): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
