'use client';

import { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

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
                plugins: [
                    'grapesjs-preset-webpage',
                    'grapesjs-blocks-basic',
                    'grapesjs-plugin-export',
                    'grapesjs-lory-slider',
                    'grapesjs-tabs',
                    'grapesjs-custom-code',
                    'grapesjs-touch',
                    'grapesjs-parser-postcss',
                ],
                pluginsOpts: {
                    'grapesjs-preset-webpage': {
                        blocks: ['link-block', 'quote', 'text-basic'],
                    },
                    'grapesjs-blocks-basic': {
                        flexGrid: true,
                    },
                    'grapesjs-plugin-export': {
                        btnLabel: 'Exportar', // Texto do botão de exportação
                        filenamePfx: 'layout', // Prefixo para arquivos exportados
                    },
                    'grapesjs-lory-slider': {
                        sliderBlock: {
                            category: 'Extra', // Categoria onde o bloco será listado
                            label: 'Slider',
                        },
                    },
                    'grapesjs-tabs': {
                        tabsBlock: {
                            category: 'Components', // Categoria no painel lateral
                            label: 'Tabs',
                        },
                    },
                    'grapesjs-custom-code': {},
                    'grapesjs-touch': {},
                    'grapesjs-parser-postcss': {},
                },
            });

            editor.setComponents(content);

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