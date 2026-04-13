import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InfoTab, PasswordTab } from '../components/ProfileModal';

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../services/api', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}));

const defaultForm = {
  first_name: 'Juan',
  last_name: 'Pérez',
  email: 'juan@correo.com',
  phone: '5512345678',
  age: '25',
  gender: 'masculino',
};

describe('InfoTab', () => {
  it('muestra skeleton cuando está cargando', () => {
    const { container } = render(
      <InfoTab
        isLoading={true}
        form={defaultForm}
        setForm={vi.fn()}
        isSaving={false}
        savedInfo={false}
        onSubmit={vi.fn()}
      />
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renderiza el formulario cuando no está cargando', () => {
    render(
      <InfoTab
        isLoading={false}
        form={defaultForm}
        setForm={vi.fn()}
        isSaving={false}
        savedInfo={false}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText('Juan')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pérez')).toBeInTheDocument();
  });

  it('muestra los valores del formulario', () => {
    render(
      <InfoTab
        isLoading={false}
        form={defaultForm}
        setForm={vi.fn()}
        isSaving={false}
        savedInfo={false}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('juan@correo.com')).toBeInTheDocument();
  });

  it('muestra "Guardando..." cuando isSaving es true', () => {
    render(
      <InfoTab
        isLoading={false}
        form={defaultForm}
        setForm={vi.fn()}
        isSaving={true}
        savedInfo={false}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByText('Guardando...')).toBeInTheDocument();
  });

  it('muestra "Guardado" cuando savedInfo es true', () => {
    render(
      <InfoTab
        isLoading={false}
        form={defaultForm}
        setForm={vi.fn()}
        isSaving={false}
        savedInfo={true}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByText('Guardado')).toBeInTheDocument();
  });

  it('muestra "Guardar Cambios" por defecto', () => {
    render(
      <InfoTab
        isLoading={false}
        form={defaultForm}
        setForm={vi.fn()}
        isSaving={false}
        savedInfo={false}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
  });

  it('llama a onSubmit al enviar el formulario', () => {
    const onSubmit = vi.fn(e => e.preventDefault());
    render(
      <InfoTab
        isLoading={false}
        form={defaultForm}
        setForm={vi.fn()}
        isSaving={false}
        savedInfo={false}
        onSubmit={onSubmit}
      />
    );
    fireEvent.submit(screen.getByRole('button', { name: /Guardar Cambios/ }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('llama a setForm al cambiar el nombre', () => {
    const setForm = vi.fn();
    render(
      <InfoTab
        isLoading={false}
        form={defaultForm}
        setForm={setForm}
        isSaving={false}
        savedInfo={false}
        onSubmit={vi.fn()}
      />
    );
    fireEvent.change(screen.getByDisplayValue('Juan'), { target: { value: 'Pedro' } });
    expect(setForm).toHaveBeenCalled();
  });

  it('botón deshabilitado cuando isSaving', () => {
    render(
      <InfoTab
        isLoading={false}
        form={defaultForm}
        setForm={vi.fn()}
        isSaving={true}
        savedInfo={false}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

const defaultPassForm = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};

describe('PasswordTab', () => {
  const defaultProps = {
    passForm: defaultPassForm,
    setPassForm: vi.fn(),
    isSaving: false,
    showCurrent: false,
    setShowCurrent: vi.fn(),
    showNew: false,
    setShowNew: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('renderiza los tres campos de contraseña', () => {
    render(<PasswordTab {...defaultProps} />);
    expect(screen.getByLabelText(/Contraseña actual/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nueva contraseña/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar nueva contraseña/)).toBeInTheDocument();
  });

  it('muestra "Cambiar Contraseña" por defecto', () => {
    render(<PasswordTab {...defaultProps} />);
    expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument();
  });

  it('muestra "Actualizando..." cuando isSaving', () => {
    render(<PasswordTab {...defaultProps} isSaving={true} />);
    expect(screen.getByText('Actualizando...')).toBeInTheDocument();
  });

  it('botón deshabilitado cuando isSaving', () => {
    render(<PasswordTab {...defaultProps} isSaving={true} />);
    expect(screen.getByRole('button', { name: /Actualizando/ })).toBeDisabled();
  });

  it('campos de contraseña son type=password por defecto', () => {
    render(<PasswordTab {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText('••••••••');
    expect(inputs[0]).toHaveAttribute('type', 'password');
  });

  it('campo contraseña actual es type=text cuando showCurrent=true', () => {
    render(<PasswordTab {...defaultProps} showCurrent={true} />);
    const input = screen.getByLabelText(/Contraseña actual/);
    expect(input).toHaveAttribute('type', 'text');
  });

  it('campo nueva contraseña es type=text cuando showNew=true', () => {
    render(<PasswordTab {...defaultProps} showNew={true} />);
    const input = screen.getByLabelText(/Nueva contraseña/);
    expect(input).toHaveAttribute('type', 'text');
  });

  it('llama a setShowCurrent al hacer clic en el botón de mostrar contraseña actual', () => {
    const setShowCurrent = vi.fn();
    render(<PasswordTab {...defaultProps} setShowCurrent={setShowCurrent} />);
    const toggleButtons = screen.getAllByRole('button', { name: '' });
    fireEvent.click(toggleButtons[0]);
    expect(setShowCurrent).toHaveBeenCalled();
  });

  it('llama a onSubmit al enviar', () => {
    const onSubmit = vi.fn(e => e.preventDefault());
    render(<PasswordTab {...defaultProps} onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByRole('button', { name: /Cambiar Contraseña/ }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
