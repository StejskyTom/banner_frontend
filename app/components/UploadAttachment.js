'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { authorizedUpload } from '../../lib/api';
import { useToast } from './ToastProvider';

export default function UploadAttachment({ widgetId, carousel, setCarousel }) {
    const showNotification = useToast();
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles.length) return;
        const file = acceptedFiles[0];
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);

            const res = await authorizedUpload(`/widgets/${widgetId}/attachments`, fd);
            if (!res.ok) {
                showNotification("Nepodařilo se nahrát soubor", 'danger');
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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg']
        },
        multiple: false
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-100'
            }`}
        >
            <input {...getInputProps()} />
            {uploading ? (
                <p className="text-gray-500">Nahrávám...</p>
            ) : isDragActive ? (
                <p className="text-blue-500">Pusť soubor sem…</p>
            ) : (
                <p className="text-gray-600">
                    Přetáhni obrázek sem nebo <span className="text-blue-600">klikni</span> pro výběr
                </p>
            )}
        </div>
    );
}
