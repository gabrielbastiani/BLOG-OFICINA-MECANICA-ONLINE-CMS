'use client';

import { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css'; // Importando o CSS principal do GrapesJS

export default function GrapesEditor({ content }: { content: string }) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      const editor = grapesjs.init({
        container: editorRef.current,
        fromElement: true,
        height: '100vh',
        width: 'auto',
        storageManager: false,
        plugins: ['grapesjs-preset-webpage'], // Carregando o preset da página
      });

      editor.setComponents(content);

      editor.Panels.addButton('options', {
        id: 'save-db',
        className: 'fa fa-floppy-o',
        command: 'save-db',
        attributes: { title: 'Salvar' },
      });

      editor.Commands.add('save-db', {
        run: function (editor) {
          const updatedContent = editor.getHtml();
          const updatedCss = editor.getCss();
          console.log('Salvar layout:', { updatedContent, updatedCss });
        },
      });
    }
  }, [content]);

  return <div ref={editorRef} />;
}