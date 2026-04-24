// Note: EditorContent from TipTap manages its own DOM safely; no raw innerHTML usage here.
import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Node, Extension, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import Toolbar from './Toolbar';

const MARGIN_OPTIONS = { narrow: 40, normal: 60, wide: 100, full: 20 };

const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{ types: ['textStyle'], attributes: { fontSize: {
      default: null,
      parseHTML: el => el.style.fontSize || null,
      renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
    }}}];
  },
  addCommands() {
    return { setFontSize: size => ({ chain }) => chain().setMark('textStyle', { fontSize: size }).run() };
  },
});

const ResizableImageComponent = ({ node, updateAttributes, selected }) => {
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const imgRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = imgRef.current?.offsetWidth || node.attrs.width || 300;
    const onMove = (e) => {
      if (!isResizing.current) return;
      updateAttributes({ width: Math.max(50, startWidth.current + e.clientX - startX.current) });
    };
    const onUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
  return (
    <NodeViewWrapper>
      <div contentEditable={false} style={{ display: 'flex', justifyContent: justifyMap[node.attrs.alignment] || 'center', userSelect: 'none', margin: '8px 0' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            ref={imgRef}
            src={node.attrs.src}
            alt={node.attrs.alt || ''}
            draggable={false}
            style={{
              width: node.attrs.width ? `${node.attrs.width}px` : 'auto',
              maxWidth: '100%',
              display: 'block',
              outline: selected ? '2px solid #6366f1' : 'none',
              borderRadius: '2px'
            }}
          />
          {selected && <>
            <button
              type="button"
              onMouseDown={handleMouseDown}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMouseDown(e); }}
              title="Arrastra para cambiar tamaño"
              style={{ position: 'absolute', bottom: -4, right: -4, width: 12, height: 12, background: '#6366f1', border: '2px solid white', cursor: 'se-resize', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', padding: 0 }}
            />
            {[
              { key: 'bottom-left', pos: { bottom: -4, left: -4 } },
              { key: 'top-right',   pos: { top: -4, right: -4 } },
              { key: 'top-left',    pos: { top: -4, left: -4 } },
            ].map(({ key, pos }) => (
              <div key={key} style={{ position: 'absolute', ...pos, width: 10, height: 10, background: 'white', border: '2px solid #6366f1', borderRadius: '2px', pointerEvents: 'none' }} />
            ))}
          </>}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

const ResizableImage = Node.create({
  name: 'image', group: 'block', atom: true, draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      alignment: { default: 'center' }
    };
  },
  parseHTML() { return [{ tag: 'img[src]' }]; },
  renderHTML({ HTMLAttributes }) {
    const { width, ...rest } = HTMLAttributes;
    const attrs = Object.fromEntries(Object.entries(rest).filter(([k]) => k !== 'alignment'));
    return ['img', mergeAttributes(attrs, { style: [width ? `width: ${width}px` : null, 'max-width: 100%'].filter(Boolean).join('; ') })];
  },
  addCommands() {
    return { setImage: (options) => ({ commands }) => commands.insertContent({ type: this.name, attrs: options }) };
  },
  addNodeView() { return ReactNodeViewRenderer(ResizableImageComponent); },
});

const PAGE_SIZES = {
  a4:     { label: 'A4',    width: 210,   height: 297   },
  letter: { label: 'Carta', width: 215.9, height: 279.4 },
  legal:  { label: 'Oficio',width: 215.9, height: 355.6 },
};
const MM_TO_PX = 3.78;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

const PROSE_MOBILE = `
  [&_.ProseMirror]:outline-none [&_.ProseMirror]:text-slate-800 [&_.ProseMirror]:leading-relaxed
  [&_.ProseMirror]:min-h-screen [&_.ProseMirror]:cursor-text [&_.ProseMirror]:p-5 [&_.ProseMirror]:text-base
  [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5
  [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5
  [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-extrabold [&_.ProseMirror_h1]:mb-4
  [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-3
  [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-2
  [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-slate-300 [&_.ProseMirror_blockquote]:text-slate-600 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic
  [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:my-4 [&_.ProseMirror_img]:rounded-lg
`;

const PROSE_DESKTOP = `
  prose prose-sm sm:prose lg:prose-lg max-w-none
  [&_.ProseMirror]:outline-none [&_.ProseMirror]:text-slate-800 [&_.ProseMirror]:leading-[1.7]
  [&_.ProseMirror]:min-h-full [&_.ProseMirror]:cursor-text
  [&_.ProseMirror_p]:mb-4 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6
  [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6
  [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:font-extrabold [&_.ProseMirror_h1]:mb-6 [&_.ProseMirror_h1]:tracking-tight
  [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-4 [&_.ProseMirror_h2]:tracking-tight
  [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-3
  [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-slate-300 [&_.ProseMirror_blockquote]:text-slate-600 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic
  [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:my-6 [&_.ProseMirror_img]:rounded-lg
`;

const RichTextEditor = ({ content, onChange, editable = true, docName = 'documento' }) => {
  const [margin, setMargin] = useState('normal');
  const [pageSize, setPageSize] = useState('a4');
  const [zoom, setZoom] = useState(100);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [imageAlign, setImageAlign] = useState('center');
  const editorRef = useRef(null);
  const isLocalUpdate = useRef(false);
  const isMobile = useIsMobile();

  const currentMargin = MARGIN_OPTIONS[margin] || 60;
  const pageConfig = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
  const pageWidth = pageConfig.width * MM_TO_PX;
  const pageHeight = pageConfig.height * MM_TO_PX;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline, TextStyle, FontSize, ResizableImage,
    ],
    content: content || '',
    editable,
    onUpdate: ({ editor }) => {
      isLocalUpdate.current = true;
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (isLocalUpdate.current) {
      isLocalUpdate.current = false;
      return;
    }
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(editable);
  }, [editor, editable]);

  const exportToPDF = useCallback(async () => {
    if (!editor) return;
    setShowExportMenu(false);
    const toastId = toast.loading('Generando PDF...');
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:794px;padding:56px 80px;background:white;color:black;font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;position:fixed;top:0;left:-9999px;';
    wrapper.appendChild(editor.view.dom.cloneNode(true));
    document.body.appendChild(wrapper);
    try {
      const [{ jsPDF }, h2cMod] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);
      const h2c = h2cMod.default ?? h2cMod;
      const canvas = await h2c(wrapper, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('link[rel="stylesheet"],style').forEach(s => s.remove());
          const s = clonedDoc.createElement('style');
          s.textContent = '*{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;color:#000}h1{font-size:24pt;font-weight:700;margin:0 0 12pt}h2{font-size:18pt;font-weight:700;margin:0 0 10pt}h3{font-size:14pt;font-weight:700;margin:0 0 8pt}p{margin:0 0 10pt}strong,b{font-weight:700}em,i{font-style:italic}u{text-decoration:underline}ul,ol{margin:0 0 10pt;padding-left:20pt}li{margin-bottom:4pt}';
          clonedDoc.head.appendChild(s);
        },
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      let drawn = 0;
      while (drawn < imgH) {
        pdf.addImage(imgData, 'PNG', 0, -drawn, pageW, imgH);
        drawn += pageH;
        if (drawn < imgH) pdf.addPage();
      }
      pdf.save(`${docName}.pdf`);
      toast.success('PDF descargado', { id: toastId });
    } catch (err) {
      toast.error(`Error al generar PDF: ${err.message}`, { id: toastId });
    } finally {
      document.body.removeChild(wrapper);
    }
  }, [editor, docName]);

  const exportToDOCX = useCallback(async () => {
    if (!editor) return;
    const docChildren = Array.from(editor.view.dom.children).map(child => {
      if (child.tagName === 'H1') return new Paragraph({ text: child.textContent, heading: HeadingLevel.HEADING_1 });
      if (child.tagName === 'H2') return new Paragraph({ text: child.textContent, heading: HeadingLevel.HEADING_2 });
      if (child.tagName === 'H3') return new Paragraph({ text: child.textContent, heading: HeadingLevel.HEADING_3 });
      if (child.tagName === 'UL' || child.tagName === 'OL') return new Paragraph({ text: child.textContent, bullet: { level: 0 } });
      return new Paragraph({ children: [new TextRun({ text: child.textContent })] });
    });
    const doc = new Document({ sections: [{ children: docChildren }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docName}.docx`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [editor, docName]);

  const exportToText = useCallback(() => {
    const text = editor?.getText() || '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docName}.txt`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [editor, docName]);

  if (!editor) return null;

  const toolbarProps = {
    editor, showExportMenu, setShowExportMenu, showImageMenu, setShowImageMenu,
    imageAlign, setImageAlign, margin, setMargin, pageSize, setPageSize,
    onExportPDF: exportToPDF, onExportDOCX: exportToDOCX, onExportText: exportToText,
    zoom, setZoom,
  };

  // Mobile: no page chrome, full width
  if (isMobile) {
    return (
      <div className="w-full h-full flex flex-col bg-white" ref={editorRef}>
        {editable && (
          <div className="relative z-30 bg-white border-b border-slate-200 shadow-sm shrink-0">
            <Toolbar {...toolbarProps} isMobile />
          </div>
        )}
        <div className="flex-1 overflow-auto cursor-text">
          <EditorContent editor={editor} className={PROSE_MOBILE} />
        </div>
      </div>
    );
  }

  // Desktop: A4 page format
  return (
    <div className="w-full h-full flex flex-col bg-slate-50/50 overflow-hidden" ref={editorRef}>
      {editable && (
        <div className="relative z-30 bg-white border-b border-slate-200 shadow-sm shrink-0">
          <Toolbar {...toolbarProps} />
        </div>
      )}
      <div className="flex-1 overflow-auto bg-slate-100/50 flex justify-center scrollbar-thin scrollbar-thumb-slate-300">
        <div
          className="p-8 md:p-12 transition-transform duration-300 origin-top h-fit"
          style={{ transform: `scale(${zoom / 100})`, width: `${pageWidth * (zoom / 100)}px`, minWidth: `${pageWidth * (zoom / 100)}px` }}
        >
          <div
            className="bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-sm border border-slate-200 cursor-text"
            style={{ width: `${pageWidth}px`, minHeight: `${pageHeight}px`, transform: `translateX(calc(-50% + ${pageWidth / 2}px))`, margin: '0 auto' }}
          >
            <div style={{ padding: `${currentMargin}px`, paddingBottom: '120px', minHeight: `${pageHeight}px` }}>
              <EditorContent editor={editor} className={PROSE_DESKTOP} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ResizableImageComponent.propTypes = {
  node: PropTypes.object.isRequired,
  updateAttributes: PropTypes.func.isRequired,
  selected: PropTypes.bool,
};

RichTextEditor.propTypes = {
  content: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  docName: PropTypes.string,
};

export default RichTextEditor;
