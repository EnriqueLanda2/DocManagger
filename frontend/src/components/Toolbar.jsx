import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  FileText, Upload, Image as ImageIcon,
  Download, Trash2,
  AlignStartHorizontal, AlignCenter as AlignCenterIcon, AlignEndHorizontal,
  ZoomIn, ZoomOut, Maximize
} from 'lucide-react';

const ToolButton = ({ icon, active, onClick, title, disabled }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-2 rounded-md transition-all duration-150 ${
      active 
        ? 'bg-indigo-600 text-white shadow-sm' 
        : 'text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed'
    }`}
  >
    {icon}
  </button>
);

const Toolbar = ({ 
  editor, showExportMenu, setShowExportMenu,
  showImageMenu, setShowImageMenu, imageAlign, setImageAlign,
  margin, setMargin, pageSize, setPageSize,
  onExportPDF, onExportDOCX, onExportText,
  zoom, setZoom
}) => {
  if (!editor) return null;

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
  const zoomLevels = [50, 75, 100, 125, 150, 200];

  return (
    <div className="sticky top-0 z-10 flex flex-col bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-1 p-2 flex-wrap">
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
          <select
            className="px-2 py-1.5 text-sm font-medium text-slate-600 bg-transparent outline-none cursor-pointer hover:bg-slate-100 rounded-md"
            onChange={(e) => editor.chain().focus().setParagraphSize(e.target.value).run()}
          >
            <option value="">Texto</option>
            {fontSizes.map(size => (
              <option key={size} value={size}>{size.replace('px', '')}px</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-0.5">
          <ToolButton
            icon={<Bold size={18} />}
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Negrita (Ctrl+B)"
          />
          <ToolButton
            icon={<Italic size={18} />}
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Cursiva (Ctrl+I)"
          />
          <ToolButton
            icon={<UnderlineIcon size={18} />}
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Subrayado (Ctrl+U)"
          />
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <div className="flex items-center gap-0.5">
          <ToolButton
            icon={<AlignLeft size={18} />}
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Alinear a la izquierda"
          />
          <ToolButton
            icon={<AlignCenter size={18} />}
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Centrar"
          />
          <ToolButton
            icon={<AlignRight size={18} />}
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Alinear a la derecha"
          />
          <ToolButton
            icon={<AlignJustify size={18} />}
            active={editor.isActive({ textAlign: 'justify' })}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            title="Justificar"
          />
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <div className="flex items-center gap-0.5">
          <ToolButton
            icon={<List size={18} />}
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Lista con viñetas"
          />
          <ToolButton
            icon={<ListOrdered size={18} />}
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Lista numerada"
          />
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <div className="flex items-center gap-0.5">
          <ToolButton
            icon={<span className="text-sm font-bold">H1</span>}
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Título 1"
          />
          <ToolButton
            icon={<span className="text-sm font-bold">H2</span>}
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Título 2"
          />
          <ToolButton
            icon={<span className="text-sm font-bold">H3</span>}
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Título 3"
          />
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <div className="relative">
          <ToolButton
            icon={<ImageIcon size={18} />}
            active={showImageMenu}
            onClick={() => setShowImageMenu(!showImageMenu)}
            title="Insertar imagen"
          />
          {showImageMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-50 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-150">
              <p className="text-xs font-semibold text-slate-500 mb-2">Alineación de imagen</p>
              <div className="flex gap-1 mb-3">
                <ToolButton icon={<AlignStartHorizontal size={18} />} active={imageAlign === 'left'} onClick={() => setImageAlign('left')} />
                <ToolButton icon={<AlignCenterIcon size={18} />} active={imageAlign === 'center'} onClick={() => setImageAlign('center')} />
                <ToolButton icon={<AlignEndHorizontal size={18} />} active={imageAlign === 'right'} onClick={() => setImageAlign('right')} />
              </div>
              <label className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 transition-colors">
                <Upload size={14} />
                <span className="text-sm font-medium">Subir imagen</span>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      editor.chain().focus().setImage({ src: event.target.result }).run();
                    };
                    reader.readAsDataURL(file);
                  }
                  setShowImageMenu(false);
                }} className="hidden" />
              </label>
              {editor.isActive('image') && (
                <button onClick={() => editor.chain().focus().deleteNode('image').run()} className="flex items-center justify-center gap-2 w-full mt-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  <Trash2 size={14} /><span className="text-sm font-medium">Eliminar</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <ToolButton
            icon={<Download size={18} />}
            active={showExportMenu}
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Exportar documento"
          />
          {showExportMenu && (
            <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 p-2 z-50 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-150">
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

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <select 
          value={margin} 
          onChange={(e) => setMargin(e.target.value)} 
          className="px-2 py-1.5 text-sm font-medium text-slate-600 bg-transparent border border-slate-200 rounded-md cursor-pointer hover:bg-slate-100"
        >
          <option value="narrow">Márgen: Angosto</option>
          <option value="normal">Márgen: Normal</option>
          <option value="wide">Márgen: Ancho</option>
          <option value="full">Márgen: Completo</option>
        </select>

        <select 
          value={pageSize} 
          onChange={(e) => setPageSize(e.target.value)} 
          className="px-2 py-1.5 text-sm font-medium text-slate-600 bg-transparent border border-slate-200 rounded-md cursor-pointer hover:bg-slate-100"
        >
          <option value="a4">A4</option>
          <option value="letter">Carta</option>
          <option value="legal">Oficio</option>
        </select>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <div className="flex items-center gap-1 bg-slate-100 rounded-md px-1">
          <ToolButton
            icon={<ZoomOut size={16} />}
            onClick={() => setZoom(Math.max(50, zoom - 25))}
            title="Alejar"
          />
          <select
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="px-1 py-1 text-xs font-medium text-slate-600 bg-transparent outline-none cursor-pointer"
          >
            {zoomLevels.map(z => (
              <option key={z} value={z}>{z}%</option>
            ))}
          </select>
          <ToolButton
            icon={<ZoomIn size={16} />}
            onClick={() => setZoom(Math.min(200, zoom + 25))}
            title="Acercar"
          />
          <ToolButton
            icon={<Maximize size={16} />}
            onClick={() => setZoom(100)}
            title="Zoom normal"
          />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
