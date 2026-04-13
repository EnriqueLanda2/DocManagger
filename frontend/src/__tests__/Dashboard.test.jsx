import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  DocumentCell,
  StatusCell,
  VersionCell,
  DateCell,
  ActionsCell,
  StatsModal,
  buildColumns,
  SpinnerTabla,
} from '../pages/Dashboard';

// Mock heavy dependencies not needed for unit tests
vi.mock('react-data-table-component', () => ({ default: () => null }));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../components/ShareModal', () => ({ default: () => null }));
vi.mock('../components/Loader', () => ({ default: () => null }));

describe('VersionCell', () => {
  it('renderiza la versión del documento', () => {
    render(<VersionCell row={{ version: 'v2.3' }} />);
    expect(screen.getByText('v2.3')).toBeInTheDocument();
  });

  it('aplica estilos de badge', () => {
    const { container } = render(<VersionCell row={{ version: 'v1' }} />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });
});

describe('DateCell', () => {
  it('renderiza la fecha de modificación', () => {
    render(<DateCell row={{ last_mod: '10/04/2026' }} />);
    expect(screen.getByText('10/04/2026')).toBeInTheDocument();
  });

  it('aplica clase de texto gris', () => {
    const { container } = render(<DateCell row={{ last_mod: '01/01/2024' }} />);
    expect(container.firstChild).toHaveClass('text-slate-400');
  });
});

describe('StatusCell', () => {
  it('muestra "En edición" cuando está bloqueado', () => {
    render(<StatusCell row={{ status: 'bloqueado', locked_by_name: 'Juan' }} />);
    expect(screen.getByText(/En edición/)).toBeInTheDocument();
    expect(screen.getByText(/Juan/)).toBeInTheDocument();
  });

  it('muestra "Disponible" cuando está libre', () => {
    render(<StatusCell row={{ status: 'disponible' }} />);
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('aplica color ámbar cuando está bloqueado', () => {
    const { container } = render(<StatusCell row={{ status: 'bloqueado', locked_by_name: 'X' }} />);
    expect(container.firstChild).toHaveClass('bg-amber-100');
  });

  it('aplica color verde cuando está disponible', () => {
    const { container } = render(<StatusCell row={{ status: 'disponible' }} />);
    expect(container.firstChild).toHaveClass('bg-emerald-100');
  });
});

describe('DocumentCell', () => {
  const row = { name: 'informe.pdf', owner: 1, owner_name: 'Ana' };

  it('renderiza el nombre del documento', () => {
    render(<DocumentCell row={row} currentUser={{ id: 1 }} />);
    expect(screen.getByText('informe.pdf')).toBeInTheDocument();
  });

  it('muestra el nombre del dueño', () => {
    render(<DocumentCell row={row} currentUser={{ id: 1 }} />);
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
  });

  it('muestra badge "Compartido" cuando el usuario no es el dueño', () => {
    render(<DocumentCell row={row} currentUser={{ id: 2 }} />);
    expect(screen.getByText('Compartido')).toBeInTheDocument();
  });

  it('no muestra badge "Compartido" cuando el usuario es el dueño', () => {
    render(<DocumentCell row={row} currentUser={{ id: 1 }} />);
    expect(screen.queryByText('Compartido')).not.toBeInTheDocument();
  });

  it('usa abreviatura de extensión', () => {
    render(<DocumentCell row={row} currentUser={{ id: 1 }} />);
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('usa primeras 2 letras sin extensión', () => {
    render(<DocumentCell row={{ name: 'reporte', owner: 1, owner_name: 'X' }} currentUser={{ id: 1 }} />);
    expect(screen.getByText('RE')).toBeInTheDocument();
  });
});

describe('ActionsCell', () => {
  const row = { id: 5, owner: 1 };
  const currentUser = { id: 1 };
  const defaultProps = {
    row,
    onOpenDoc: vi.fn(),
    isLoading: false,
    openingDocId: null,
    currentUser,
    onOpenMenu: vi.fn(),
  };

  it('muestra botón "Abrir" normalmente', () => {
    render(<ActionsCell {...defaultProps} />);
    expect(screen.getByText('Abrir')).toBeInTheDocument();
  });

  it('muestra spinner cuando se está abriendo este documento', () => {
    render(<ActionsCell {...defaultProps} openingDocId={5} />);
    expect(screen.queryByText('Abrir')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('llama a onOpenDoc al hacer clic en Abrir', () => {
    const onOpenDoc = vi.fn();
    render(<ActionsCell {...defaultProps} onOpenDoc={onOpenDoc} />);
    fireEvent.click(screen.getByText('Abrir'));
    expect(onOpenDoc).toHaveBeenCalledWith(row);
  });

  it('muestra botón de menú cuando el usuario es dueño', () => {
    render(<ActionsCell {...defaultProps} />);
    expect(document.querySelector('[title="Más opciones"]')).toBeInTheDocument();
  });

  it('no muestra botón de menú cuando el usuario no es dueño', () => {
    render(<ActionsCell {...defaultProps} currentUser={{ id: 99 }} />);
    expect(document.querySelector('[title="Más opciones"]')).not.toBeInTheDocument();
  });

  it('llama a onOpenMenu al hacer clic en menú', () => {
    const onOpenMenu = vi.fn();
    render(<ActionsCell {...defaultProps} onOpenMenu={onOpenMenu} />);
    fireEvent.click(document.querySelector('[title="Más opciones"]'));
    expect(onOpenMenu).toHaveBeenCalled();
  });
});

describe('StatsModal', () => {
  const documents = [
    { id: 1, name: 'doc-a.pdf', owner: 1, owner_name: 'Juan', last_mod: '01/04', status: 'disponible' },
    { id: 2, name: 'doc-b', owner: 2, owner_name: 'Ana', last_mod: '02/04', status: 'bloqueado', locked_by_name: 'Ana' },
  ];
  const currentUser = { id: 1 };

  it('muestra todos los documentos', () => {
    render(<StatsModal type="all" documents={documents} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getByText('Todos los Documentos')).toBeInTheDocument();
    expect(screen.getByText('doc-a.pdf')).toBeInTheDocument();
    expect(screen.getByText('doc-b')).toBeInTheDocument();
  });

  it('filtra documentos en edición', () => {
    render(<StatsModal type="editing" documents={documents} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getByText('Documentos en Edición')).toBeInTheDocument();
    expect(screen.queryByText('doc-a.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('doc-b')).toBeInTheDocument();
  });

  it('filtra documentos compartidos (no propios)', () => {
    render(<StatsModal type="shared" documents={documents} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getByText('Documentos Compartidos')).toBeInTheDocument();
    expect(screen.queryByText('doc-a.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('doc-b')).toBeInTheDocument();
  });

  it('muestra mensaje vacío cuando no hay documentos', () => {
    render(<StatsModal type="editing" documents={[]} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getByText('Ningún documento está siendo editado ahora.')).toBeInTheDocument();
  });

  it('llama a onClose al hacer clic en X', () => {
    const onClose = vi.fn();
    render(<StatsModal type="all" documents={documents} currentUser={currentUser} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('muestra abreviatura del nombre del documento', () => {
    render(<StatsModal type="all" documents={documents} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('muestra badge "Editando" para documentos bloqueados en la lista', () => {
    render(<StatsModal type="all" documents={documents} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getByText('Editando')).toBeInTheDocument();
  });

  it('muestra badge "Libre" para documentos disponibles en la lista', () => {
    render(<StatsModal type="all" documents={documents} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getByText('Libre')).toBeInTheDocument();
  });

  it('muestra "Editado por" en tipo editing', () => {
    render(<StatsModal type="editing" documents={documents} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getByText(/Editado por/)).toBeInTheDocument();
  });

  it('muestra "Dueño:" en tipo all', () => {
    render(<StatsModal type="all" documents={documents} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getAllByText(/Dueño:/).length).toBeGreaterThan(0);
  });

  it('muestra mensaje vacío para tipo shared sin documentos', () => {
    render(<StatsModal type="shared" documents={[{ id: 1, name: 'x', owner: 1, owner_name: 'A', last_mod: '01/04', status: 'disponible' }]} currentUser={{ id: 1 }} onClose={vi.fn()} />);
    expect(screen.getByText('No tienes documentos compartidos contigo.')).toBeInTheDocument();
  });

  it('muestra mensaje vacío para tipo all sin documentos', () => {
    render(<StatsModal type="all" documents={[]} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getByText('No tienes documentos aún.')).toBeInTheDocument();
  });

  it('muestra cantidad de documentos en el badge', () => {
    render(<StatsModal type="all" documents={documents} currentUser={currentUser} onClose={vi.fn()} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

describe('SpinnerTabla', () => {
  it('renderiza el spinner de carga', () => {
    const { container } = render(<SpinnerTabla />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('muestra texto de carga', () => {
    render(<SpinnerTabla />);
    expect(screen.getByText('Cargando documentos...')).toBeInTheDocument();
  });
});

describe('buildColumns', () => {
  const currentUser = { id: 1 };
  const cols = buildColumns(currentUser, vi.fn(), false, null, vi.fn());

  it('retorna 5 columnas', () => {
    expect(cols).toHaveLength(5);
  });

  it('primera columna es Documento', () => {
    expect(cols[0].name).toBe('Documento');
  });

  it('segunda columna es Estado', () => {
    expect(cols[1].name).toBe('Estado');
  });

  it('tercera columna es Versión', () => {
    expect(cols[2].name).toBe('Versión');
  });

  it('cuarta columna es Modificado', () => {
    expect(cols[3].name).toBe('Modificado');
  });

  it('quinta columna es Acciones', () => {
    expect(cols[4].name).toBe('Acciones');
  });

  it('columnas tienen selector cuando corresponde', () => {
    expect(cols[0].selector({ name: 'test.pdf' })).toBe('test.pdf');
    expect(cols[1].selector({ status: 'disponible' })).toBe('disponible');
    expect(cols[2].selector({ version: 'v1' })).toBe('v1');
    expect(cols[3].selector({ last_mod: '10/04' })).toBe('10/04');
  });

  it('columnas con sortable=true en las primeras 4', () => {
    expect(cols[0].sortable).toBe(true);
    expect(cols[1].sortable).toBe(true);
    expect(cols[2].sortable).toBe(true);
    expect(cols[3].sortable).toBe(true);
  });

  it('renderiza DocumentCell con la columna Documento', () => {
    const { container } = render(cols[0].cell({ name: 'archivo.pdf', owner: 1, owner_name: 'Juan' }));
    expect(container).toBeTruthy();
  });

  it('renderiza StatusCell con la columna Estado', () => {
    const { container } = render(cols[1].cell({ status: 'disponible' }));
    expect(container).toBeTruthy();
  });
});
