import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import Toolbar from './Toolbar';

const MARGIN_OPTIONS = { narrow: 40, normal: 60, wide: 100, full: 20 };
const PAGE_SIZES = {
  a4: { label: 'A4', width: 210, height: 297 },
  letter: { label: 'Carta', width: 215.9, height: 279.4 },
  legal: { label: 'Oficio', width: 215.9, height: 355.6 },
};
const MM_TO_PX = 3.78;

const RichTextEditor = ({ content, onChange, editable = true, docName = 'documento' }) => {
  const [margin, setMargin] = useState('normal');
  const [pageSize, setPageSize] = useState('a4');
  const [zoom, setZoom] = useState(100);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [imageAlign, setImageAlign] = useState('center');
  const editorRef = useRef(null);
  const [docHeight, setDocHeight] = useState(297 * MM_TO_PX);

  const currentMargin = MARGIN_OPTIONS[margin] || 60;
  const pageConfig = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
  const pageWidth = pageConfig.width * MM_TO_PX;
  const pageHeight = pageConfig.height * MM_TO_PX;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
    ],
    content: content || '',
    editable,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    const updateHeight = () => {
      if (!editorRef.current) return;
      const proseMirror = editorRef.current.querySelector('.ProseMirror');
      if (!proseMirror) return;
      
      const contentHeight = proseMirror.scrollHeight;
      const minHeight = pageHeight;
      const newHeight = Math.max(minHeight, contentHeight + currentMargin * 2);
      setDocHeight(newHeight);
    };

    updateHeight();
    const interval = setInterval(updateHeight, 300);
    return () => clearInterval(interval);
  }, [editor?.getHTML(), pageHeight, currentMargin]);

  useEffect(() => {
    if (content && editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const exportToPDF = useCallback(() => {
    const htmlContent = editor?.getHTML() || '';
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para descargar el PDF');
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${docName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12pt; 
            line-height: 1.6; 
            padding: 20mm;
            max-width: 210mm;
            margin: 0 auto;
          }
          h1 { font-size: 24pt; font-weight: bold; }
          h2 { font-size: 18pt; font-weight: bold; }
          h3 { font-size: 14pt; font-weight: bold; }
          p { margin-bottom: 12pt; text-align: justify; }
          ul, ol { margin-left: 20pt; margin-bottom: 12pt; }
          img { max-width: 100%; height: auto; }
          @media print {
            body { padding: 0; }
            @page { margin: 20mm; size: A4; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
    setShowExportMenu(false);
  }, [editor, docName]);

  const exportToDOCX = useCallback(async () => {
    const html = editor?.getHTML() || '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const children = Array.from(tempDiv.children);
    const docChildren = children.map(child => {
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
    a.click();
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
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [editor, docName]);

  if (!editor) return null;

  return (
    <div className="w-full flex flex-col h-full">
      {editable && (
        <Toolbar
          editor={editor}
          showExportMenu={showExportMenu}
          setShowExportMenu={setShowExportMenu}
          showImageMenu={showImageMenu}
          setShowImageMenu={setShowImageMenu}
          imageAlign={imageAlign}
          setImageAlign={setImageAlign}
          margin={margin}
          setMargin={setMargin}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onExportPDF={exportToPDF}
          onExportDOCX={exportToDOCX}
          onExportText={exportToText}
          zoom={zoom}
          setZoom={setZoom}
        />
      )}

      <div ref={editorRef} className="flex-1 overflow-auto bg-slate-200 p-4 md:p-8">
        <div className="flex justify-center" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
          <div
            className="bg-white shadow-2xl relative"
            style={{
              width: `${pageWidth}px`,
              minHeight: `${docHeight}px`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{ padding: `${currentMargin}px` }}
            >
              <EditorContent
                editor={editor}
                className="prose prose-sm sm:prose lg:prose-lg max-w-none
                  [&_.ProseMirror]:outline-none [&_.ProseMirror]:text-slate-800 [&_.ProseMirror]:leading-[1.6]
                  [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6
                  [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6
                  [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4
                  [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-3
                  [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-2
                  [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-indigo-500
                  [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:my-4
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
