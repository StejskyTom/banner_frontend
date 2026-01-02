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



const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return '#000000';

    // Remove hash
    let hex = hexcolor.toString().replace('#', '');

    // Handle 3-char shorthand
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Attempt to handle non-hex colors or incomplete hex by defaulting to black
    // (browser defaults invalid background to white usually)
    if (hex.length !== 6) return '#000000';

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';

    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
};

const ColorInput = ({ label, value, onChange }) => {
    const textColor = getContrastYIQ(value);

    return (
        <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block">{label}</label>
            <div className="relative group">
                <div className="relative flex items-center h-10 w-full rounded-md border border-gray-600 shadow-sm overflow-hidden ring-1 ring-white/5 transition-all focus-within:ring-2 focus-within:ring-indigo-500">
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-full text-left text-sm font-bold uppercase font-mono border-none focus:outline-none pl-3 pr-10"
                        style={{ backgroundColor: value || '#ffffff', color: textColor }}
                    />

                    {/* Color Picker Trigger (Right Side) */}
                    <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-pointer border-l border-black/10 hover:bg-black/20 bg-black/5">
                        <SwatchIcon className="h-5 w-5 opacity-70" style={{ color: textColor }} />
                        <input
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

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
                        <input
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
                                <input
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
                                <input
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
                            <input
                                value={widget.authorTitle || ''}
                                onChange={(e) => handleUpdate('authorTitle', e.target.value)}
                                placeholder="CEO & Founder"
                                className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            />
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400">Bio</label>
                            <textarea
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

                    {/* Border Radius */}
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-400">Zaoblení rohů</label>
                            <span className="text-xs text-gray-500">{widget.borderRadius || 0}px</span>
                        </div>
                        <RangeSlider
                            value={widget.borderRadius || 0}
                            onChange={(e) => handleUpdate('borderRadius', parseInt(e.target.value))}
                            min={0}
                            max={50}
                            step={1}
                        />
                    </div>

                    <hr className="border-gray-800" />

                    <div className="grid grid-cols-2 gap-3">
                        <ColorInput
                            label="Barva pozadí"
                            value={widget.backgroundColor || '#ffffff'}
                            onChange={(val) => handleUpdate('backgroundColor', val)}
                        />

                        <ColorInput
                            label="Barva jména"
                            value={widget.nameColor || '#111827'}
                            onChange={(val) => handleUpdate('nameColor', val)}
                        />

                        <ColorInput
                            label="Barva titulu"
                            value={widget.titleColor || '#4f46e5'}
                            onChange={(val) => handleUpdate('titleColor', val)}
                        />

                        <ColorInput
                            label="Barva bia"
                            value={widget.bioColor || '#4b5563'}
                            onChange={(val) => handleUpdate('bioColor', val)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
