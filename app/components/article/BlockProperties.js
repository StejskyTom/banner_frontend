'use client';

import { useState, useEffect } from 'react';
import { authorizedFetch } from '../../../lib/api';
import { RangeControl, Input, TextArea, Select } from './Helpers';
import ImageUpload from './ImageUpload';
import RichTextToolbar from './RichTextToolbar';
import Toggle from '../Toggle';
import { SwatchIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return '#000000';

    // Remove hash
    let hex = hexcolor.toString().replace('#', '');

    // Handle 3-char shorthand
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Attempt to handle non-hex colors or incomplete hex by defaulting to black
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
                <div className="relative flex items-center h-10 w-full rounded-md border border-gray-600 shadow-sm overflow-hidden ring-1 ring-white/5 transition-all focus-within:ring-2 focus-within:ring-visualy-accent-4">
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

export function TextProperties({ block, onChange, activeFormats = {} }) {
    return (
        <>
            <RichTextToolbar activeFormats={activeFormats} />

            <Select
                label="Zarovnání"
                value={block.align || 'left'}
                onChange={(val) => onChange({ ...block, align: val })}
                options={[
                    { value: 'left', label: 'Vlevo' },
                    { value: 'center', label: 'Na střed' },
                    { value: 'right', label: 'Vpravo' },
                    { value: 'justify', label: 'Do bloku' },
                ]}
            />
        </>
    );
}

export function ImageProperties({ block, onChange, widgetId }) {
    return (
        <>
            <ImageUpload url={block.url} onChange={(url) => onChange({ ...block, url })} widgetId={widgetId} />
            <RangeControl
                label="Šířka obrázku"
                value={block.width || 100}
                onChange={(val) => onChange({ ...block, width: val })}
                min={10}
                max={100}
            />
            <Select
                label="Zarovnání"
                value={block.align || 'center'}
                onChange={(val) => onChange({ ...block, align: val })}
                options={[
                    { value: 'left', label: 'Vlevo' },
                    { value: 'center', label: 'Na střed' },
                    { value: 'right', label: 'Vpravo' },
                ]}
            />
        </>
    );
}

export function WrapProperties({ block, onChange, widgetId, activeFormats = {} }) {
    return (
        <>
            <RichTextToolbar activeFormats={activeFormats} />
            <Select
                label="Pozice obrázku"
                value={block.imgPos || 'right'}
                onChange={(val) => onChange({ ...block, imgPos: val })}
                options={[
                    { value: 'left', label: 'Vlevo' },
                    { value: 'right', label: 'Vpravo' },
                ]}
            />
            <ImageUpload url={block.imgUrl} onChange={(url) => onChange({ ...block, imgUrl: url })} widgetId={widgetId} />
            <RangeControl
                label="Šířka obrázku"
                value={block.imgWidth || 40}
                onChange={(val) => onChange({ ...block, imgWidth: val })}
                min={20}
                max={60}
            />
        </>
    );
}

export function TableProperties({ block, onChange }) {
    const updateDimensions = (rows, cols) => {
        const newHeader = [...(block.header || [])];
        const newData = [...(block.data || [])];

        // Adjust columns
        if (cols > newHeader.length) {
            for (let i = newHeader.length; i < cols; i++) newHeader.push('Sloupec ' + (i + 1));
            newData.forEach(row => {
                for (let i = row.length; i < cols; i++) row.push('');
            });
        } else if (cols < newHeader.length) {
            newHeader.length = cols;
            newData.forEach(row => row.length = cols);
        }

        // Adjust rows
        if (rows > newData.length) {
            for (let i = newData.length; i < rows; i++) {
                newData.push(new Array(cols).fill(''));
            }
        } else if (rows < newData.length) {
            newData.length = rows;
        }

        onChange({ ...block, rows, cols, header: newHeader, data: newData });
    };

    return (
        <>
            <div className="flex gap-4 mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Řádky</label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={block.rows || 3}
                        onChange={(e) => updateDimensions(parseInt(e.target.value) || 1, block.cols || 3)}
                        className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sloupce</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={block.cols || 3}
                        onChange={(e) => updateDimensions(block.rows || 3, parseInt(e.target.value) || 1)}
                        className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            <Select
                label="Styl ohraničení"
                value={block.borderStyle || 'full'}
                onChange={(val) => onChange({ ...block, borderStyle: val })}
                options={[
                    { value: 'full', label: 'Mřížka (vše)' },
                    { value: 'rows', label: 'Pouze řádky' },
                    { value: 'none', label: 'Žádné' },
                ]}
            />

            <div className="mb-4">
                <Toggle
                    checked={block.outerBorder !== false}
                    onChange={(val) => onChange({ ...block, outerBorder: val })}
                    label="Vnější ohraničení"
                />
            </div>

            <RangeControl
                label="Šířka tabulky"
                value={block.width || 100}
                onChange={(val) => onChange({ ...block, width: val })}
                min={20}
                max={100}
                unit="%"
            />

            <Select
                label="Zarovnání textu"
                value={block.textAlign || 'left'}
                onChange={(val) => onChange({ ...block, textAlign: val })}
                options={[
                    { value: 'left', label: 'Vlevo' },
                    { value: 'center', label: 'Na střed' },
                    { value: 'right', label: 'Vpravo' },
                ]}
            />

            <RangeControl
                label="Zaoblení rohů"
                value={block.borderRadius !== undefined ? block.borderRadius : 8}
                onChange={(val) => onChange({ ...block, borderRadius: val })}
                min={0}
                max={24}
                unit="px"
            />

            <div className="grid grid-cols-2 gap-3 mb-4">
                <ColorInput
                    label="Barva záhlaví"
                    value={block.headerBgColor || '#f3f4f6'}
                    onChange={(val) => onChange({ ...block, headerBgColor: val })}
                />
                <ColorInput
                    label="Barva textu"
                    value={block.headerTextColor || '#111827'}
                    onChange={(val) => onChange({ ...block, headerTextColor: val })}
                />
            </div>
        </>
    );
}

export function BannerProperties({ block, onChange }) {
    return (
        <>
            <Input
                label="Text banneru"
                value={block.content}
                onChange={(val) => onChange({ ...block, content: val })}
                placeholder="NADPIS SEKCE"
            />
            <div className="grid grid-cols-2 gap-3">
                <ColorInput
                    label="Barva pozadí"
                    value={block.bgColor || '#f3f4f6'}
                    onChange={(val) => onChange({ ...block, bgColor: val })}
                />
                <ColorInput
                    label="Barva textu"
                    value={block.textColor || '#111827'}
                    onChange={(val) => onChange({ ...block, textColor: val })}
                />
            </div>
        </>
    );
}

export function ProductProperties({ block, onChange, widgetId }) {
    const [mode, setMode] = useState('manual'); // 'manual' | 'search'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = async (term) => {
        setSearchTerm(term);
        if (!term || term.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await authorizedFetch(`/heureka/products/search?search=${encodeURIComponent(term)}&limit=5`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.products || []);
                setShowResults(true);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectProduct = (product) => {
        onChange({
            ...block,
            name: product.productName,
            description: product.description ? product.description.substring(0, 200) + (product.description.length > 200 ? '...' : '') : '',
            imgUrl: product.imgUrl || '',
            price: product.priceVat ? `${product.priceVat} Kč` : '',
            link: product.url || '',
            btnText: 'Koupit'
        });
        setShowResults(false);
        setSearchTerm('');
    };

    return (
        <>
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
                <button
                    className={`flex-1 py-1 text-sm font-medium rounded-md transition ${mode === 'manual' ? 'bg-white dark:bg-gray-600 shadow text-visualy-accent-4 dark:text-visualy-accent-4' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    onClick={() => setMode('manual')}
                >
                    Manuálně
                </button>
                <button
                    className={`flex-1 py-1 text-sm font-medium rounded-md transition ${mode === 'search' ? 'bg-white dark:bg-gray-600 shadow text-visualy-accent-4 dark:text-visualy-accent-4' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    onClick={() => setMode('search')}
                >
                    Vybrat produkt
                </button>
            </div>

            {mode === 'search' && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vyhledat produkt</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Hledat podle názvu..."
                            className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-9">
                                <div className="animate-spin h-4 w-4 border-2 border-visualy-accent-4 rounded-full border-t-transparent"></div>
                            </div>
                        )}

                        {showResults && searchResults.length > 0 && (
                            <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {searchResults.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => selectProduct(product)}
                                        className="p-2 hover:bg-visualy-accent-4/10 dark:hover:bg-visualy-accent-4/20 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-3"
                                    >
                                        {product.imgUrl && <img src={product.imgUrl} className="w-8 h-8 object-contain rounded bg-white" alt="" />}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.productName}</div>
                                            <div className="text-xs text-green-600 font-bold">{product.priceVat} Kč</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {mode === 'manual' && (
                <>
                    <Input
                        label="Název produktu"
                        value={block.name}
                        onChange={(val) => onChange({ ...block, name: val })}
                        placeholder="Název produktu"
                    />
                    <TextArea
                        label="Popis produktu"
                        value={block.description}
                        onChange={(val) => onChange({ ...block, description: val })}
                        placeholder="Krátký popis produktu..."
                        rows={3}
                    />
                    <ImageUpload
                        label="Foto produktu"
                        url={block.imgUrl}
                        onChange={(url) => onChange({ ...block, imgUrl: url })}
                        widgetId={widgetId}
                    />
                    <Input
                        label="Cena"
                        value={block.price}
                        onChange={(val) => onChange({ ...block, price: val })}
                        placeholder="199 Kč"
                    />
                    <Input
                        label="Odkaz na produkt"
                        value={block.link}
                        onChange={(val) => onChange({ ...block, link: val })}
                        placeholder="https://..."
                    />
                </>
            )}

            <Input
                label="Text tlačítka"
                value={block.btnText || 'Koupit'}
                onChange={(val) => onChange({ ...block, btnText: val })}
                placeholder="Koupit"
            />
            <div className="grid grid-cols-2 gap-3 mb-4">
                <ColorInput
                    label="Barva tlačítka"
                    value={block.btnColor || '#26AD80'}
                    onChange={(val) => onChange({ ...block, btnColor: val })}
                />
            </div>
        </>
    );
}

const LAYOUT_PRESETS = [
    { label: '50 / 50', columns: [50, 50] },
    { label: '33 / 33 / 33', columns: [33.33, 33.33, 33.34] },
    { label: '25 / 50 / 25', columns: [25, 50, 25] },
    { label: '30 / 70', columns: [30, 70] },
    { label: '70 / 30', columns: [70, 30] },
    { label: '25 / 25 / 25 / 25', columns: [25, 25, 25, 25] },
];

export function LayoutProperties({ block, onChange }) {
    const applyPreset = (preset) => {
        const newColumns = preset.columns.map((width, i) => {
            const existing = block.columns[i];
            return {
                id: existing?.id || crypto.randomUUID(),
                width,
                blocks: existing?.blocks || [],
            };
        });
        onChange({ ...block, columns: newColumns });
    };

    const updateColumnWidth = (index, newWidth) => {
        const newColumns = block.columns.map((col, i) =>
            i === index ? { ...col, width: newWidth } : col
        );
        onChange({ ...block, columns: newColumns });
    };

    const addColumn = () => {
        if (block.columns.length >= 6) return;
        const evenWidth = Math.floor(100 / (block.columns.length + 1));
        const newColumns = [
            ...block.columns.map(col => ({ ...col, width: evenWidth })),
            { id: crypto.randomUUID(), width: evenWidth, blocks: [] }
        ];
        onChange({ ...block, columns: newColumns });
    };

    const removeColumn = (index) => {
        if (block.columns.length <= 1) return;
        const newColumns = block.columns.filter((_, i) => i !== index);
        const evenWidth = Math.floor(100 / newColumns.length);
        onChange({ ...block, columns: newColumns.map(col => ({ ...col, width: evenWidth })) });
    };

    return (
        <>
            <div className="space-y-6">
                {/* PRESETS SECTION */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Rychlá volba rozložení</label>
                    <div className="grid grid-cols-2 gap-3">
                        {LAYOUT_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => applyPreset(preset)}
                                className="group relative p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all text-left"
                            >
                                <div className="flex gap-1.5 mb-2 h-8">
                                    {preset.columns.map((w, i) => (
                                        <div
                                            key={i}
                                            className="h-full bg-gray-700 rounded-md border border-gray-600 group-hover:bg-visualy-accent-4/20 group-hover:border-visualy-accent-4/50 transition-colors"
                                            style={{ width: `${w}%` }}
                                        />
                                    ))}
                                </div>
                                <span className="text-[10px] font-medium text-gray-500 group-hover:text-gray-300">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-gray-800" />

                {/* GAP CONTROL */}
                <RangeControl
                    label="Mezera mezi sloupci"
                    value={block.gap !== undefined ? block.gap : 16}
                    onChange={(val) => onChange({ ...block, gap: val })}
                    min={0}
                    max={64}
                    step={4}
                    unit="px"
                />

                <div className="h-px bg-gray-800" />

                {/* COLUMNS MANAGEMENT */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Sloupce ({block.columns.length})
                        </label>
                        {block.columns.length < 6 && (
                            <button
                                onClick={addColumn}
                                className="text-xs bg-visualy-accent-4/10 text-visualy-accent-4 hover:bg-visualy-accent-4/20 hover:text-visualy-accent-4 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                            >
                                <PlusIcon className="w-3 h-3" />
                                Přidat
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {block.columns.map((col, i) => (
                            <div key={col.id} className="group flex items-center gap-3 p-3 bg-gray-800/80 rounded-xl border border-gray-700/80 hover:border-gray-600 transition-colors">
                                <div className="flex flex-col flex-1 gap-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400 font-medium">Sloupec {i + 1}</span>
                                        <span className="text-white font-mono">{Math.round(col.width)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min={10}
                                            max={100}
                                            step={1}
                                            value={Math.round(col.width)}
                                            onChange={(e) => updateColumnWidth(i, parseFloat(e.target.value) || 10)}
                                            className="flex-1 h-1.5 bg-gray-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-visualy-accent-4 hover:[&::-webkit-slider-thumb]:bg-visualy-accent-4/80 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                {block.columns.length > 1 && (
                                    <button
                                        onClick={() => removeColumn(i)}
                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Odstranit sloupec"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export function AuthorProperties({ block, onChange, widgetId }) {
    const [mode, setMode] = useState('manual'); // 'manual' | 'select'
    const [authors, setAuthors] = useState([]);
    const [selectedAuthorId, setSelectedAuthorId] = useState('');

    useEffect(() => {
        if (mode === 'select' && authors.length === 0) {
            authorizedFetch('/author-widgets')
                .then(res => res.json())
                .then(data => {
                    setAuthors(data);
                })
                .catch(err => console.error('Error fetching authors:', err));
        }
    }, [mode, authors.length]);

    const selectAuthor = (author) => {
        onChange({
            ...block,
            name: author.authorName,
            title: author.authorTitle,
            bio: author.authorBio,
            photoUrl: author.authorPhotoUrl,
            layout: author.layout || 'centered',
            backgroundColor: author.backgroundColor,
            borderRadius: author.borderRadius
        });
        setSelectedAuthorId(author.id);
    };

    return (
        <>
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
                <button
                    className={`flex-1 py-1 text-sm font-medium rounded-md transition ${mode === 'manual' ? 'bg-white dark:bg-gray-600 shadow text-visualy-accent-4 dark:text-visualy-accent-4' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    onClick={() => setMode('manual')}
                >
                    Manuálně
                </button>
                <button
                    className={`flex-1 py-1 text-sm font-medium rounded-md transition ${mode === 'select' ? 'bg-white dark:bg-gray-600 shadow text-visualy-accent-4 dark:text-visualy-accent-4' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    onClick={() => setMode('select')}
                >
                    Vybrat widget
                </button>
            </div>

            {mode === 'select' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vybrat autora</label>
                    <select
                        value={selectedAuthorId}
                        onChange={(e) => {
                            const author = authors.find(a => a.id === e.target.value);
                            if (author) selectAuthor(author);
                        }}
                        className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    >
                        <option value="">Vyberte autora...</option>
                        {authors.map(author => (
                            <option key={author.id} value={author.id}>{author.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {mode === 'manual' && (
                <>
                    <Input
                        label="Jméno"
                        value={block.name}
                        onChange={(val) => onChange({ ...block, name: val })}
                        placeholder="Jméno autora"
                    />
                    <Input
                        label="Titul / Pozice"
                        value={block.title}
                        onChange={(val) => onChange({ ...block, title: val })}
                        placeholder="CEO"
                    />
                    <TextArea
                        label="Bio"
                        value={block.bio}
                        onChange={(val) => onChange({ ...block, bio: val })}
                        placeholder="Krátké bio..."
                        rows={3}
                    />
                    <ImageUpload
                        label="Foto"
                        url={block.photoUrl}
                        onChange={(url) => onChange({ ...block, photoUrl: url })}
                        widgetId={widgetId}
                    />
                </>
            )}
        </>
    );
}
