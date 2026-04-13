import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EditingBadge, ReadOnlyBadge } from '../pages/Editor';

describe('EditingBadge', () => {
  it('muestra "Editando" en desktop cuando no guarda', () => {
    render(<EditingBadge isSaving={false} />);
    expect(screen.getByText('Editando')).toBeInTheDocument();
  });

  it('muestra "Guardando..." en desktop cuando guarda', () => {
    render(<EditingBadge isSaving={true} />);
    expect(screen.getByText('Guardando...')).toBeInTheDocument();
  });

  it('no muestra texto en mobile cuando guarda', () => {
    render(<EditingBadge isSaving={true} mobile />);
    expect(screen.queryByText('Guardando...')).not.toBeInTheDocument();
  });

  it('no muestra texto en mobile cuando no guarda', () => {
    render(<EditingBadge isSaving={false} mobile />);
    expect(screen.queryByText('Editando')).not.toBeInTheDocument();
  });

  it('aplica clase bg-blue-100 cuando guarda en desktop', () => {
    const { container } = render(<EditingBadge isSaving={true} />);
    expect(container.firstChild).toHaveClass('bg-blue-100');
  });

  it('aplica clase bg-emerald-100 cuando no guarda en desktop', () => {
    const { container } = render(<EditingBadge isSaving={false} />);
    expect(container.firstChild).toHaveClass('bg-emerald-100');
  });
});

describe('ReadOnlyBadge', () => {
  it('muestra "Solo Lectura" en desktop', () => {
    render(<ReadOnlyBadge />);
    expect(screen.getByText('Solo Lectura')).toBeInTheDocument();
  });

  it('no muestra texto en mobile', () => {
    render(<ReadOnlyBadge mobile />);
    expect(screen.queryByText('Solo Lectura')).not.toBeInTheDocument();
  });

  it('aplica clase bg-amber-100', () => {
    const { container } = render(<ReadOnlyBadge />);
    expect(container.firstChild).toHaveClass('bg-amber-100');
  });

  it('aplica clase bg-amber-100 en mobile', () => {
    const { container } = render(<ReadOnlyBadge mobile />);
    expect(container.firstChild).toHaveClass('bg-amber-100');
  });
});
