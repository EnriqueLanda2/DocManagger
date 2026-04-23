import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  FileText, Upload, Image as ImageIcon,
  Download, Trash2,
  AlignStartHorizontal, AlignCenter as AlignCenterIcon, AlignEndHorizontal,
  ZoomIn, ZoomOut, Maximize, ChevronDown
} from 'lucide-react';

const ToolButton = ({ icon, active, onClick, title, disabled }) => (
  <button
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-2 rounded-lg transition-all duration-150 flex items-center justify-center min-w-[36px] min-h-[36px] touch-manipulation ${active
      ? 'bg-slate-100 text-slate-900 shadow-sm font-semibold'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
    }`}
  >
    {icon}
  </button>
);

ToolButton.propTypes = {
  icon: PropTypes.node.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  title: PropTypes.string,
  disabled: PropTypes.bool,
};

const Sep = () => <div className="w-px h-6 bg-slate-200/60 mx-1 shrink-0" />;

const ImageDropdown = ({ imageMenuRef, inputId, showImageMenu, setShowImageMenu, imageAlign, setImageAlign, editor }) => {
  const btnRef = useRef(null);
  const [dropStyle, setDropStyle] = useState({});

  const handleToggle = () => {
    if (!showImageMenu && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropStyle({ top: rect.bottom + 4, left: rect.left });
    }
    setShowImageMenu(!showImageMenu);
  };

  return (
    <div className="shrink-0" ref={imageMenuRef}>
      <div ref={btnRef}>
        <ToolButton
          icon={<ImageIcon size={17} />}
          active={showImageMenu}
          onClick={handleToggle}
          title="Insertar imagen"
        />
      </div>
      {showImageMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-[9999] min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ top: `${dropStyle.top}px`, left: `${dropStyle.left}px` }}
        >
          <p className="text-xs font-semibold text-slate-500 mb-2">Alineación de imagen</p>
          <div className="flex gap-1 mb-3">
            <ToolButton icon={<AlignStartHorizontal size={17} />} active={imageAlign === 'left'} onClick={() => setImageAlign('left')} title="Izquierda" />
            <ToolButton icon={<AlignCenterIcon size={17} />} active={imageAlign === 'center'} onClick={() => setImageAlign('center')} title="Centro" />
            <ToolButton icon={<AlignEndHorizontal size={17} />} active={imageAlign === 'right'} onClick={() => setImageAlign('right')} title="Derecha" />
          </div>
          <label
            htmlFor={inputId}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            <Upload size={14} />
            <span className="text-sm font-medium">Subir imagen</span>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    editor.chain().focus().setImage({ src: ev.target.result, alignment: imageAlign }).run();
                  };
                  reader.readAsDataURL(file);
                }
                setShowImageMenu(false);
              }}
              className="hidden"
            />
          </label>
          {editor.isActive('image') && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteNode('image').run()}
              className="flex items-center justify-center gap-2 w-full mt-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 size={14} /><span className="text-sm font-medium">Eliminar imagen</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

ImageDropdown.propTypes = {
  imageMenuRef: PropTypes.object.isRequired,
  inputId: PropTypes.string.isRequired,
  showImageMenu: PropTypes.bool,
  setShowImageMenu: PropTypes.func.isRequired,
  imageAlign: PropTypes.string,
  setImageAlign: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
};

const ExportDropdown = ({ exportMenuRef, showExportMenu, setShowExportMenu, onExportPDF, onExportDOCX, onExportText }) => {
  const btnRef = useRef(null);
  const [dropStyle, setDropStyle] = useState({});

  const handleToggle = () => {
    if (!showExportMenu && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropStyle({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setShowExportMenu(!showExportMenu);
  };

  return (
    <div className="shrink-0" ref={exportMenuRef}>
      <div ref={btnRef}>
        <ToolButton
          icon={<Download size={17} />}
          active={showExportMenu}
          onClick={handleToggle}
          title="Exportar documento"
        />
      </div>
      {showExportMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-slate-200 p-2 z-[9999] min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ top: `${dropStyle.top}px`, right: `${dropStyle.right}px` }}
        >
          <button onClick={onExportPDF} className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
            <FileText size={16} /><span className="text-sm font-medium">Exportar PDF</span>
          </button>
          <button onClick={onExportDOCX} className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
            <FileText size={16} /><span className="text-sm font-medium">Exportar DOCX</span>
          </button>
          <button onClick={onExportText} className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
            <FileText size={16} /><span className="text-sm font-medium">Exportar TXT</span>
          </button>
        </div>
      )}
    </div>
  );
};

ExportDropdown.propTypes = {
  exportMenuRef: PropTypes.object.isRequired,
  showExportMenu: PropTypes.bool,
  setShowExportMenu: PropTypes.func.isRequired,
  onExportPDF: PropTypes.func,
  onExportDOCX: PropTypes.func,
  onExportText: PropTypes.func,
};

const SecondaryTools = ({
  imageMenuRef, inputId, exportMenuRef,
  showImageMenu, setShowImageMenu, imageAlign, setImageAlign, editor,
  showExportMenu, setShowExportMenu, onExportPDF, onExportDOCX, onExportText,
  margin, setMargin, pageSize, setPageSize, zoom, setZoom,
}) => {
  const zoomLevels = [50, 75, 100, 125, 150, 200];
  return (
    <>
      <div className="flex items-center gap-0.5 shrink-0">
        <ToolButton icon={<span className="text-sm font-bold">H1</span>} active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Título 1" />
        <ToolButton icon={<span className="text-sm font-bold">H2</span>} active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título 2" />
        <ToolButton icon={<span className="text-sm font-bold">H3</span>} active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Título 3" />
      </div>
      <Sep />
      <ImageDropdown
        imageMenuRef={imageMenuRef}
        inputId={inputId}
        showImageMenu={showImageMenu}
        setShowImageMenu={setShowImageMenu}
        imageAlign={imageAlign}
        setImageAlign={setImageAlign}
        editor={editor}
      />
      <ExportDropdown
        exportMenuRef={exportMenuRef}
        showExportMenu={showExportMenu}
        setShowExportMenu={setShowExportMenu}
        onExportPDF={onExportPDF}
        onExportDOCX={onExportDOCX}
        onExportText={onExportText}
      />
      <Sep />
      <select
        value={margin}
        onChange={(e) => setMargin(e.target.value)}
        className="px-2 py-1.5 text-xs sm:text-sm font-medium text-slate-600 bg-transparent border border-slate-200 rounded-md cursor-pointer hover:bg-slate-100 shrink-0"
      >
        <option value="narrow">Mrg: Angosto</option>
        <option value="normal">Mrg: Normal</option>
        <option value="wide">Mrg: Ancho</option>
        <option value="full">Mrg: Completo</option>
      </select>
      <select
        value={pageSize}
        onChange={(e) => setPageSize(e.target.value)}
        className="px-2 py-1.5 text-xs sm:text-sm font-medium text-slate-600 bg-transparent border border-slate-200 rounded-md cursor-pointer hover:bg-slate-100 shrink-0"
      >
        <option value="a4">A4</option>
        <option value="letter">Carta</option>
        <option value="legal">Oficio</option>
      </select>
      <Sep />
      <div className="flex items-center gap-0.5 bg-slate-100 rounded-md px-1 shrink-0">
        <ToolButton icon={<ZoomOut size={15} />} onClick={() => setZoom(Math.max(50, zoom - 25))} title="Alejar" />
        <select
          value={zoom}
          onChange={(e) => setZoom(Number.parseInt(e.target.value))}
          className="px-1 py-1 text-xs font-medium text-slate-600 bg-transparent outline-none cursor-pointer"
        >
          {zoomLevels.map(z => <option key={z} value={z}>{z}%</option>)}
        </select>
        <ToolButton icon={<ZoomIn size={15} />} onClick={() => setZoom(Math.min(200, zoom + 25))} title="Acercar" />
        <ToolButton icon={<Maximize size={15} />} onClick={() => setZoom(100)} title="Zoom normal" />
      </div>
    </>
  );
};

SecondaryTools.propTypes = {
  imageMenuRef: PropTypes.object.isRequired,
  inputId: PropTypes.string.isRequired,
  exportMenuRef: PropTypes.object.isRequired,
  showImageMenu: PropTypes.bool,
  setShowImageMenu: PropTypes.func.isRequired,
  imageAlign: PropTypes.string,
  setImageAlign: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
  showExportMenu: PropTypes.bool,
  setShowExportMenu: PropTypes.func.isRequired,
  onExportPDF: PropTypes.func,
  onExportDOCX: PropTypes.func,
  onExportText: PropTypes.func,
  margin: PropTypes.string,
  setMargin: PropTypes.func.isRequired,
  pageSize: PropTypes.string,
  setPageSize: PropTypes.func.isRequired,
  zoom: PropTypes.number,
  setZoom: PropTypes.func.isRequired,
};

const Toolbar = ({
  editor, showExportMenu, setShowExportMenu,
  showImageMenu, setShowImageMenu, imageAlign, setImageAlign,
  margin, setMargin, pageSize, setPageSize,
  onExportPDF, onExportDOCX, onExportText,
  zoom, setZoom
}) => {
  const imageMenuRefDesktop = useRef(null);
  const exportMenuRefDesktop = useRef(null);
  const imageMenuRefMobile = useRef(null);
  const exportMenuRefMobile = useRef(null);

  const [showMoreTools, setShowMoreTools] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideImage =
        imageMenuRefDesktop.current?.contains(e.target) ||
        imageMenuRefMobile.current?.contains(e.target);
      if (showImageMenu && !insideImage) setShowImageMenu(false);

      const insideExport =
        exportMenuRefDesktop.current?.contains(e.target) ||
        exportMenuRefMobile.current?.contains(e.target);
      if (showExportMenu && !insideExport) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showImageMenu, showExportMenu, setShowImageMenu, setShowExportMenu]);

  if (!editor) return null;

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];

  const secondaryProps = {
    showImageMenu, setShowImageMenu, imageAlign, setImageAlign, editor,
    showExportMenu, setShowExportMenu, onExportPDF, onExportDOCX, onExportText,
    margin, setMargin, pageSize, setPageSize, zoom, setZoom,
  };

  return (
    <div className="sticky top-0 z-40 flex flex-col bg-white border-b border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      {/* Primary row — always visible */}
      <div className="flex items-center gap-1 p-2 px-3">
        {/* Font size */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200/60 shrink-0">
          <select
            className="px-2 py-1.5 text-sm font-medium text-slate-600 bg-slate-50/50 hover:bg-slate-100 border border-transparent hover:border-slate-200 outline-none cursor-pointer rounded-lg transition-colors"
            onChange={(e) => { if (e.target.value) editor.chain().focus().setFontSize(e.target.value).run(); }}
          >
            <option value="">Tamaño</option>
            {fontSizes.map(size => (
              <option key={size} value={size}>{size.replace('px', '')}px</option>
            ))}
          </select>
        </div>

        {/* Bold, Italic, Underline */}
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolButton icon={<Bold size={17} />} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrita (Ctrl+B)" />
          <ToolButton icon={<Italic size={17} />} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursiva (Ctrl+I)" />
          <ToolButton icon={<UnderlineIcon size={17} />} active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Subrayado (Ctrl+U)" />
        </div>

        <Sep />

        {/* Alignment */}
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolButton icon={<AlignLeft size={17} />} active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Izquierda" />
          <ToolButton icon={<AlignCenter size={17} />} active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centrar" />
          <ToolButton icon={<AlignRight size={17} />} active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Derecha" />
          <ToolButton icon={<AlignJustify size={17} />} active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justificar" />
        </div>

        <Sep />

        {/* Lists */}
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolButton icon={<List size={17} />} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista" />
          <ToolButton icon={<ListOrdered size={17} />} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada" />
        </div>

        {/* Desktop secondary tools — inline, hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <Sep />
          <SecondaryTools
            imageMenuRef={imageMenuRefDesktop}
            inputId="upload-image-desktop"
            exportMenuRef={exportMenuRefDesktop}
            {...secondaryProps}
          />
        </div>

        {/* Mobile "Más" toggle — hidden on sm+ */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowMoreTools(!showMoreTools)}
          className="sm:hidden ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors shrink-0 touch-manipulation"
        >
          <ChevronDown size={14} className={`transition-transform duration-200 ${showMoreTools ? 'rotate-180' : ''}`} />
          Más
        </button>
      </div>

      {/* Mobile secondary row — only on mobile, shown when toggled */}
      {showMoreTools && (
        <div className="sm:hidden flex items-center flex-wrap gap-1.5 px-3 py-2.5 border-t border-slate-100 bg-slate-50/70">
          <SecondaryTools
            imageMenuRef={imageMenuRefMobile}
            inputId="upload-image-mobile"
            exportMenuRef={exportMenuRefMobile}
            {...secondaryProps}
          />
        </div>
      )}
    </div>
  );
};

Toolbar.propTypes = {
  editor: PropTypes.object,
  showExportMenu: PropTypes.bool,
  setShowExportMenu: PropTypes.func,
  showImageMenu: PropTypes.bool,
  setShowImageMenu: PropTypes.func,
  imageAlign: PropTypes.string,
  setImageAlign: PropTypes.func,
  margin: PropTypes.string,
  setMargin: PropTypes.func,
  pageSize: PropTypes.string,
  setPageSize: PropTypes.func,
  onExportPDF: PropTypes.func,
  onExportDOCX: PropTypes.func,
  onExportText: PropTypes.func,
  zoom: PropTypes.number,
  setZoom: PropTypes.func,
};

export default Toolbar;
