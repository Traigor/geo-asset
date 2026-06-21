import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AssetForm } from './AssetForm';

describe('AssetForm', () => {
  it('blocks submit when name is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AssetForm
        mode="create"
        initialAsset={null}
        isSubmitting={false}
        pickedLocation={{ lat: 42.36, lng: -71.06 }}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        onStartPickingLocation={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AssetForm
        mode="create"
        initialAsset={null}
        isSubmitting={false}
        pickedLocation={{ lat: 42.36, lng: -71.06 }}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        onStartPickingLocation={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/name/i), 'Sensor S-0001');
    await user.selectOptions(screen.getByLabelText(/type/i), 'sensor');
    await user.selectOptions(screen.getByLabelText(/status/i), 'warning');
    await user.type(screen.getByLabelText(/installed at/i), '2020-01-10');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Sensor S-0001',
      type: 'sensor',
      status: 'warning',
      lat: 42.36,
      lng: -71.06,
      installed_at: '2020-01-10',
      last_inspected_at: null,
      notes: '',
    });
  });

  it('blocks submit when installed date is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AssetForm
        mode="create"
        initialAsset={null}
        isSubmitting={false}
        pickedLocation={{ lat: 42.36, lng: -71.06 }}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        onStartPickingLocation={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/name/i), 'Sensor S-0001');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(screen.getByText(/installed date is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });


  it('starts map location picking', async () => {
    const user = userEvent.setup();
    const onStartPickingLocation = vi.fn();

    render(
      <AssetForm
        mode="create"
        initialAsset={null}
        isSubmitting={false}
        pickedLocation={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        onStartPickingLocation={onStartPickingLocation}
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /pick location/i }));

    expect(onStartPickingLocation).toHaveBeenCalledOnce();
  });

  it('emits live status changes for map preview color', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <AssetForm
        mode="create"
        initialAsset={null}
        isSubmitting={false}
        pickedLocation={null}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        onStartPickingLocation={vi.fn()}
        onStatusChange={onStatusChange}
      />,
    );

    await user.selectOptions(screen.getByLabelText(/status/i), 'critical');

    expect(onStatusChange).toHaveBeenLastCalledWith('critical');
  });
});
