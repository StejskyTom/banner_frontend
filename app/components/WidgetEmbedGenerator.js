import { useState, useEffect } from 'react';
import { CodeBracketIcon, ClipboardDocumentIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function WidgetEmbedGenerator({ widgetId, widgetType }) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [copied, setCopied] = useState(false);

    const embedCode = `<script src="${process.env.NEXT_PUBLIC_API_URL || 'https://yourapp.com'}/widget/${widgetId}/embed.js"></script>`;

    const copyToClipboard = async (e) => {
        e?.stopPropagation();

        try {
            await navigator.clipboard.writeText(embedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback pro starší prohlížeče
            try {
                const textArea = document.createElement('textarea');
                textArea.value = embedCode;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (fallbackErr) {
                // Pokud ani fallback nefunguje, nic neděláme
            }
        }
    };

    // Funkce pro otevření s animací
    const openPopup = () => {
        setIsPopupOpen(true);
        setTimeout(() => setIsAnimating(true), 10); // Malé zpoždění pro trigger animace
    };

    // Funkce pro zavření s animací
    const closePopup = () => {
        setIsAnimating(false);
        setTimeout(() => setIsPopupOpen(false), 200); // Počkáme na dokončení animace
    };

    // Funkce pro zavření při kliku na overlay
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closePopup();
        }
    };

    // ESC klávesa pro zavření
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isPopupOpen) {
                closePopup();
            }
        };

        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isPopupOpen]);

    return (
        <>
            <button
                onClick={openPopup}
                className="text-blue-500 hover:text-blue-700 p-1 transition-colors duration-200"
                title="Získat embed kód"
            >
                <CodeBracketIcon className="h-5 w-5" />
            </button>

            {/* Popup Modal s animacemi */}
            {isPopupOpen && (
                <div
                    className={`fixed inset-0 flex items-center justify-center z-50 text-left transition-all duration-200 ease-out ${
                        isAnimating
                            ? 'bg-gray-800/50 backdrop-blur-sm'
                            : 'bg-gray-800/0'
                    }`}
                    onClick={handleOverlayClick}
                >
                    <div className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transition-all duration-200 ease-out ${
                        isAnimating
                            ? 'scale-100 opacity-100 translate-y-0'
                            : 'scale-95 opacity-0 translate-y-4'
                    }`}>
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-semibold">
                                Embed kód pro {widgetType}
                            </h3>
                            <button
                                onClick={closePopup}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-150 hover:scale-110"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Zkopírujte tento kód a vložte ho do HTML vaší stránky na místo, kde chcete zobrazit widget.
                            </p>

                            {/* Kód s možností výběru */}
                            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm mb-4 relative group">
                                <code className="block overflow-x-auto">
                                    {embedCode}
                                </code>

                                {/* Kopírovat ikonka v pravém horním rohu */}
                                <button
                                    onClick={async (e) => await copyToClipboard(e)}
                                    className={`absolute top-2 right-2 p-2 rounded transition-all duration-200 hover:scale-105 ${
                                        copied
                                            ? 'bg-green-500 text-white scale-110'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                    title={copied ? 'Zkopírováno!' : 'Kopírovat kód'}
                                >
                                    {copied ? (
                                        <CheckIcon className="h-4 w-4" />
                                    ) : (
                                        <ClipboardDocumentIcon className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={async () => await copyToClipboard()}
                                    className={`flex-1 px-4 py-2 rounded font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                                        copied
                                            ? 'bg-green-500 text-white scale-105'
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                >
                                    {copied ? (
                                        <>
                                            <CheckIcon className="h-4 w-4 inline mr-2" />
                                            Zkopírováno!
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardDocumentIcon className="h-4 w-4 inline mr-2" />
                                            Kopírovat kód
                                        </>
                                    )}
                                </button>

                                <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'https://yourapp.com'}/widget/${widgetId}/embed.js`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    Zobrazit JS
                                </a>
                            </div>

                            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                                <strong>Tip:</strong> Widget se automaticky zobrazí na místě, kde vložíte script tag.
                                Žádné další nastavení není potřeba.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}