'use client';

import { useState } from 'react';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/solid';
import { authorizedUpload } from '../../../lib/api';
import { useToast } from '../ToastProvider';
import { Input } from './Helpers';

export default function ImageUpload({ url, onChange, widgetId, label = "Obrázek" }) {
    const [uploading, setUploading] = useState(false);
    const showNotification = useToast();

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await authorizedUpload(`/article-widgets/${widgetId}/image`, formData);

            if (res.ok) {
                const data = await res.json();
                onChange(data.url);
            } else {
                showNotification('Chyba při nahrávání obrázku', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showNotification('Chyba při nahrávání obrázku', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
            <div className="flex gap-4 items-start">
                {url ? (
                    <div className="relative w-24 h-24 flex-shrink-0 group">
                        <img src={url} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                        <button
                            onClick={() => onChange('')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <label className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition bg-gray-50 dark:bg-gray-800">
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">{uploading ? '...' : 'Nahrát'}</span>
                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                    </label>
                )}
                <div className="flex-1">
                    <Input value={url} onChange={onChange} placeholder="Nebo vložte URL obrázku" />
                </div>
            </div>
        </div>
    );
}
