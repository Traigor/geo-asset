import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AssetFilters } from './AssetFilters';

describe('AssetFilters', () => {
  it('emits type and status filter changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AssetFilters filters={{}} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText(/type/i), 'sensor');
    await user.selectOptions(screen.getByLabelText(/status/i), 'warning');

    expect(onChange).toHaveBeenLastCalledWith({ type: 'sensor', status: 'warning' });
  });

  it('does not render sort or radius controls', () => {
    const onChange = vi.fn();

    render(<AssetFilters filters={{}} onChange={onChange} />);

    expect(screen.queryByLabelText(/sort/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/radius search/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /apply radius/i })).not.toBeInTheDocument();
  });

  it('renders a lightweight clear filters action instead of reset', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AssetFilters
        filters={{ type: 'sensor', status: 'warning', sortBy: 'name', sortDirection: 'desc' }}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenLastCalledWith({
      sortBy: 'name',
      sortDirection: 'desc',
    });
  });
});
