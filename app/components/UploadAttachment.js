'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { authorizedUpload, authorizedUploadExternal } from '../../lib/api';
import { useToast } from './ToastProvider';

export default function UploadAttachment({ widgetId, carousel, setCarousel }) {
    const showNotification = useToast();
    const [uploading, setUploading] = useState(false);
    const [newLogoUrl, setNewLogoUrl] = useState('');
    const [uploadingUrl, setUploadingUrl] = useState(false);

    // Existující onDrop pro soubory
    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles.length) return;
        const file = acceptedFiles[0];
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);

            const res = await authorizedUpload(`/widgets/${widgetId}/attachments`, fd);
            if (!res.ok) {
                const error = await res.json();
                showNotification(error.error || "Nepodařilo se nahrát soubor", 'danger');
                return;
            }

            const newAttachment = await res.json();
            // Přidej do stavu
            setCarousel({
                ...carousel,
                attachments: [...(carousel.attachments || []), newAttachment]
            });
            showNotification('Soubor byl nahrán', 'success');
        } catch (err) {
            console.error('Upload error:', err);
            showNotification('Chyba při nahrávání', 'danger');
        } finally {
            setUploading(false);
        }
    }, [widgetId, carousel, setCarousel, showNotification]);

    // Nová funkce pro přidání URL
    const handleAddLogoFromUrl = useCallback(async () => {
        // Validace prázdného inputu
        if (!newLogoUrl.trim()) {
            showNotification('Zadejte URL obrázku', 'warning');
            return;
        }

        // Základní validace URL
        try {
            const url = new URL(newLogoUrl);
            // Kontrola, že je to http nebo https
            if (!['http:', 'https:'].includes(url.protocol)) {
                showNotification('URL musí začínat http:// nebo https://', 'danger');
                return;
            }
        } catch {
            showNotification('Neplatná URL adresa', 'danger');
            return;
        }

        setUploadingUrl(true);
        try {
            const res = await authorizedUploadExternal(
                `/widgets/${widgetId}/attachments`,
                { url: newLogoUrl }
            );

            if (!res.ok) {
                const error = await res.json();
                showNotification(error.error || "Nepodařilo se přidat obrázek z URL", 'danger');
                return;
            }

            const newAttachment = await res.json();

            // Přidej do stavu
            setCarousel({
                ...carousel,
                attachments: [...(carousel.attachments || []), newAttachment]
            });

            // Vyčisti input po úspěšném přidání
            setNewLogoUrl('');
            showNotification('Obrázek byl přidán z URL', 'success');
        } catch (err) {
            console.error('URL upload error:', err);
            showNotification('Chyba při přidávání obrázku z URL', 'danger');
        } finally {
            setUploadingUrl(false);
        }
    }, [newLogoUrl, widgetId, carousel, setCarousel, showNotification]);

    // Handler pro Enter klávesu v inputu
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !uploadingUrl) {
            e.preventDefault();
            handleAddLogoFromUrl();
        }
    }, [handleAddLogoFromUrl, uploadingUrl]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg']
        },
        multiple: false,
        disabled: uploading || uploadingUrl // Zakázat dropzone při jakémkoliv nahrávání
    });

    return (
        <>
            {/* Input pro URL */}
            <div>
                <label className="text-sm font-medium text-gray-700">Nové logo (URL)</label>
                <div className="flex gap-2 mt-1">
                    <input
                        value={newLogoUrl}
                        onChange={(e) => setNewLogoUrl(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="https://example.com/image.jpg"
                        disabled={uploadingUrl || uploading}
                        className="flex-1 bg-white border border-gray-300 text-sm px-3 py-2 rounded shadow-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={handleAddLogoFromUrl}
                        disabled={uploadingUrl || uploading || !newLogoUrl.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm shadow-sm
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {uploadingUrl ? 'Přidávám...' : 'Přidat'}
                    </button>
                </div>
            </div>

            {/* Oddělovač */}
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">nebo</span>
                </div>
            </div>

            {/* Dropzone pro soubory */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                    isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-100'
                } ${
                    (uploading || uploadingUrl)
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-gray-400'
                }`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="space-y-2">
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <p className="text-gray-500">Nahrávám soubor...</p>
                    </div>
                ) : uploadingUrl ? (
                    <p className="text-gray-400">Počkejte, přidávám obrázek z URL...</p>
                ) : isDragActive ? (
                    <p className="text-blue-500">Pusť soubor sem…</p>
                ) : (
                    <div>
                        <p className="text-gray-600">
                            Přetáhni obrázek sem nebo <span className="text-blue-600">klikni</span> pro výběr
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, WEBP, SVG (max. 5MB)
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}