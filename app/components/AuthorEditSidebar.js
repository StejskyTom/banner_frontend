import { useState, useEffect, useRef } from 'react';
import {
    PhotoIcon,
    UserIcon,
    Bars3BottomLeftIcon,
    SwatchIcon,
    ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import AuthorImageUpload from './AuthorImageUpload';
import RangeSlider from './RangeSlider';

function DebouncedInput({ value, onChange, delay = 50, Component = 'input', ...props }) {
    const [localValue, setLocalValue] = useState(value);
    const timeoutRef = useRef(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setLocalValue(newVal);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            // Create a synthetic event-like object to satisfy parent handlers
            onChange({ target: { value: newVal } });
        }, delay);
    };

    return <Component {...props} value={localValue} onChange={handleChange} />;
}

function DebouncedTextarea({ value, onChange, delay = 50, ...props }) {
    const [localValue, setLocalValue] = useState(value);
    const timeoutRef = useRef(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setLocalValue(newVal);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            onChange({ target: { value: newVal } });
        }, delay);
    };

    return <textarea {...props} value={localValue} onChange={handleChange} />;
}

export default function AuthorEditSidebar({ widget, setWidget, activeTab }) {
    const handleUpdate = (field, value) => {
        setWidget(prev => ({ ...prev, [field]: value }));
    };

    if (activeTab === 'content') {
        return (
            <div className="dark w-80 bg-gray-900 border-r border-gray-800 text-white flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="font-semibold text-white">Obsah</h2>
                </div>

                <div className="p-4 space-y-6">
                    {/* Widget Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400">Název widgetu</label>
                        <DebouncedInput
                            value={widget.name || ''}
                            onChange={(e) => handleUpdate('name', e.target.value)}
                            placeholder="Např. Můj profil"
                            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Autor</h3>

                        {/* Photo */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400">Fotografie</label>
                            <AuthorImageUpload
                                widgetId={widget.id}
                                onUploadComplete={(url) => handleUpdate('authorPhotoUrl', url)}
                            />
                            <div className="mt-2">
                                <label className="text-xs text-gray-500">Nebo URL</label>
                                <DebouncedInput
                                    value={widget.authorPhotoUrl || ''}
                                    onChange={(e) => handleUpdate('authorPhotoUrl', e.target.value)}
                                    placeholder="https://..."
                                    className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1 text-white"
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400">Jméno a příjmení</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <DebouncedInput
                                    value={widget.authorName || ''}
                                    onChange={(e) => handleUpdate('authorName', e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9 text-white"
                                    placeholder="Jan Novák"
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400">Titul / Pozice</label>
                            <DebouncedInput
                                value={widget.authorTitle || ''}
                                onChange={(e) => handleUpdate('authorTitle', e.target.value)}
                                placeholder="CEO & Founder"
                                className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            />
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400">Bio</label>
                            <DebouncedTextarea
                                value={widget.authorBio || ''}
                                onChange={(e) => handleUpdate('authorBio', e.target.value)}
                                rows={5}
                                placeholder="Napište něco o sobě..."
                                className="flex min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'settings') {
        return (
            <div className="dark w-80 bg-gray-900 border-r border-gray-800 text-white flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="font-semibold text-white">Nastavení</h2>
                </div>

                <div className="p-4 space-y-6">
                    {/* Layout */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400">Rozložení</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleUpdate('layout', 'centered')}
                                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition ${widget.layout === 'centered'
                                    ? 'border-visualy-accent-4 bg-visualy-accent-4/10 text-visualy-accent-4'
                                    : 'border-gray-700 hover:border-gray-600 text-gray-500'
                                    }`}
                            >
                                <div className="w-full h-12 bg-gray-800 rounded flex flex-col items-center justify-center gap-1 p-1">
                                    <div className="w-4 h-4 rounded-full bg-gray-600"></div>
                                    <div className="w-8 h-1 bg-gray-600 rounded"></div>
                                </div>
                                <span className="text-xs font-medium">Na střed</span>
                            </button>

                            <button
                                onClick={() => handleUpdate('layout', 'side-by-side')}
                                className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition ${widget.layout === 'side-by-side'
                                    ? 'border-visualy-accent-4 bg-visualy-accent-4/10 text-visualy-accent-4'
                                    : 'border-gray-700 hover:border-gray-600 text-gray-500'
                                    }`}
                            >
                                <div className="w-full h-12 bg-gray-800 rounded flex items-center gap-1 p-1">
                                    <div className="w-5 h-5 rounded-full bg-gray-600 flex-shrink-0"></div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="w-full h-1 bg-gray-600 rounded"></div>
                                        <div className="w-2/3 h-1 bg-gray-600 rounded"></div>
                                    </div>
                                </div>
                                <span className="text-xs font-medium">Vedle sebe</span>
                            </button>
                        </div>
                    </div>

                    {/* Background Color */}
                    <div className="space-y-3">
                        <label className="text-xs font-medium text-gray-400 mb-2 block">Barva pozadí</label>
                        <div className="flex items-center gap-3">
                            <DebouncedInput
                                type="color"
                                value={widget.backgroundColor || '#ffffff'}
                                onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
                                className="h-8 w-12 bg-transparent border border-gray-700 rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500 uppercase">{widget.backgroundColor || '#ffffff'}</span>
                        </div>
                    </div>

                    {/* Border Radius */}
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400">Zaoblení rohů</label>
                            <span className="text-xs text-gray-500">{widget.borderRadius || 0}px</span>
                        </div>
                        <DebouncedInput
                            Component={RangeSlider}
                            value={widget.borderRadius || 0}
                            onChange={(e) => handleUpdate('borderRadius', parseInt(e.target.value))}
                            min={0}
                            max={50}
                            step={1}
                        />
                    </div>

                    <hr className="border-gray-800" />

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-2 block">Barva jména</label>
                            <div className="flex items-center gap-3">
                                <DebouncedInput
                                    type="color"
                                    value={widget.nameColor || '#111827'}
                                    onChange={(e) => handleUpdate('nameColor', e.target.value)}
                                    className="h-8 w-12 bg-transparent border border-gray-700 rounded cursor-pointer"
                                />
                                <span className="text-xs text-gray-500 uppercase">{widget.nameColor || '#111827'}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-2 block">Barva titulu/pozice</label>
                            <div className="flex items-center gap-3">
                                <DebouncedInput
                                    type="color"
                                    value={widget.titleColor || '#4f46e5'}
                                    onChange={(e) => handleUpdate('titleColor', e.target.value)}
                                    className="h-8 w-12 bg-transparent border border-gray-700 rounded cursor-pointer"
                                />
                                <span className="text-xs text-gray-500 uppercase">{widget.titleColor || '#4f46e5'}</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-2 block">Barva bia</label>
                            <div className="flex items-center gap-3">
                                <DebouncedInput
                                    type="color"
                                    value={widget.bioColor || '#4b5563'}
                                    onChange={(e) => handleUpdate('bioColor', e.target.value)}
                                    className="h-8 w-12 bg-transparent border border-gray-700 rounded cursor-pointer"
                                />
                                <span className="text-xs text-gray-500 uppercase">{widget.bioColor || '#4b5563'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
