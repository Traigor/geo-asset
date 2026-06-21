import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Asset } from '../model/assetTypes';
import { AssetList } from './AssetList';

describe('AssetList', () => {
  it('renders assets and calls onSelect when an item is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn<(asset: Asset) => void>();

    render(
      <AssetList
        assets={[assetFixture]}
        selectedAssetId={undefined}
        isLoading={false}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole('button', { name: /sensor s-0001/i }));

    expect(onSelect).toHaveBeenCalledWith(assetFixture);
  });

  it('renders an empty state when there are no assets', () => {
    render(<AssetList assets={[]} selectedAssetId={undefined} isLoading={false} onSelect={vi.fn()} />);

    expect(screen.getByText(/no assets found/i)).toBeInTheDocument();
  });
});

const assetFixture: Asset = {
  id: '17fc695a-07a0-4a6e-8822-e8f36c031199',
  name: 'Sensor S-0001',
  type: 'sensor',
  status: 'warning',
  lat: 42.36,
  lng: -71.06,
  installed_at: '2020-01-10',
  last_inspected_at: null,
  notes: '',
};
