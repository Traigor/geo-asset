import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ResultsToolbar } from './ResultsToolbar';

describe('ResultsToolbar', () => {
  it('emits sort option changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ResultsToolbar filters={{}} resultLabel="1-50 of 150" onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText(/sort/i), 'name:desc');

    expect(onChange).toHaveBeenLastCalledWith({
      sortBy: 'name',
      sortDirection: 'desc',
    });
  });

  it('clears only the active map area from filters', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ResultsToolbar
        filters={{
          type: 'sensor',
          status: 'warning',
          sortBy: 'name',
          sortDirection: 'asc',
          bounds: { minLat: 40, minLng: -75, maxLat: 45, maxLng: -70 },
        }}
        resultLabel="1-50 of 150"
        onChange={onChange}
      />,
    );

    expect(screen.getByText(/map area active/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear map area/i }));

    expect(onChange).toHaveBeenLastCalledWith({
      type: 'sensor',
      status: 'warning',
      sortBy: 'name',
      sortDirection: 'asc',
    });
  });
});
