'use client';

import { useState, useEffect } from 'react';
import { ClipboardDocumentIcon, CheckIcon, XMarkIcon, CodeBracketIcon } from '@heroicons/react/24/solid';
import { authorizedFetch } from '../../lib/api';

// Map widgetType → API embed URL pattern
const getEmbedUrl = (widgetType, widgetId) => {
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    switch (widgetType) {
        case 'Article': return `${base}/article-widgets/${widgetId}/embed.js`;
        case 'Author': return `${base}/author-widgets/${widgetId}/embed.js`;
        case 'FAQ': return `${base}/faq-widgets/${widgetId}/embed.js`;
        case 'Product': return `${base}/heureka/feed/${widgetId}/embed.js`;
        case 'Logo': return `${base}/widget/${widgetId}/embed.js`;
        default: return `${base}/widget/${widgetId}/embed.js`;
    }
};

export function WidgetEmbedGenerator({ widgetId, widgetType, open, onClose }) {
    const [copied, setCopied] = useState(false);

    const embedUrl = getEmbedUrl(widgetType, widgetId);
    const embedCode = `<script src="${embedUrl}" defer></script>`;

    // ESC klávesa pro zavření
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && open) onClose?.();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    const copyToClipboard = async (e) => {
        e?.stopPropagation();
        try {
            await navigator.clipboard.writeText(embedCode);
        } catch {
            // fallback
            const ta = document.createElement('textarea');
            ta.value = embedCode;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CodeBracketIcon className="h-5 w-5 text-visualy-accent-4" />
                        Publikovat widget
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 cursor-pointer transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Vložte tento kód do vašich stránek tam, kde chcete zobrazit widget.
                </p>

                {/* Code block */}
                <div className="relative mb-2">
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-all">
                        {embedCode}
                    </pre>
                    <button
                        onClick={copyToClipboard}
                        className={`absolute top-2 right-2 p-2 rounded-md shadow-sm border transition-all cursor-pointer ${copied
                                ? 'bg-visualy-accent-4 border-visualy-accent-4 text-white'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:text-visualy-accent-4 dark:hover:text-visualy-accent-4'
                            }`}
                        title={copied ? 'Zkopírováno!' : 'Zkopírovat'}
                    >
                        {copied
                            ? <CheckIcon className="h-5 w-5" />
                            : <ClipboardDocumentIcon className="h-5 w-5" />
                        }
                    </button>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 italic">
                    Před zkopírováním kódu nezapomeňte uložit změny.
                </p>

                {/* Footer */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${copied
                                ? 'bg-visualy-accent-4/10 text-visualy-accent-4 border border-visualy-accent-4/30'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                    >
                        {copied
                            ? <><CheckIcon className="h-4 w-4" /> Zkopírováno!</>
                            : <><ClipboardDocumentIcon className="h-4 w-4" /> Kopírovat kód</>
                        }
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-visualy-accent-4 text-white hover:bg-visualy-accent-4/90 transition-colors text-sm font-medium cursor-pointer"
                    >
                        Zavřít
                    </button>
                </div>
            </div>
        </div>
    );
}