'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { authorizedUpload } from '../../lib/api';
import { useToast } from './ToastProvider';
import { PhotoIcon } from '@heroicons/react/24/solid';

export default function AuthorImageUpload({ widgetId, onUploadComplete }) {
    const showNotification = useToast();
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (!acceptedFiles.length) return;
        const file = acceptedFiles[0];
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);

            const res = await authorizedUpload(`/author-widgets/${widgetId}/upload`, fd);
            if (!res.ok) {
                const error = await res.json();
                showNotification(error.error || "Nepodařilo se nahrát soubor", 'error');
                return;
            }

            const data = await res.json();
            onUploadComplete(data.url);
            showNotification('Fotografie byla nahrána', 'success');
        } catch (err) {
            showNotification('Chyba při nahrávání', 'error');
        } finally {
            setUploading(false);
        }
    }, [widgetId, onUploadComplete, showNotification]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg']
        },
        multiple: false,
        disabled: uploading
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${isDragActive
                ? 'border-visualy-accent-4 bg-visualy-accent-4/10 dark:bg-visualy-accent-4/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                } ${uploading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-gray-400 dark:hover:border-gray-500'
                }`}
        >
            <input {...getInputProps()} />
            {uploading ? (
                <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-visualy-accent-4 mx-auto"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nahrávám...</p>
                </div>
            ) : isDragActive ? (
                <>
                    <PhotoIcon className="h-10 w-10 text-visualy-accent-4" />
                    <p className="text-visualy-accent-4 font-medium">Pusťte obrázek zde...</p>
                </>
            ) : (
                <>
                    <PhotoIcon className="h-10 w-10 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Klikněte nebo přetáhněte obrázek
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            PNG, JPG, WEBP (max. 5MB)
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
