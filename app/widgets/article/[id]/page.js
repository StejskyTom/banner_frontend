'use strict';
'use client';

import { useState, useEffect, use } from 'react';
import { authorizedFetch, authorizedUpload } from '../../../../lib/api';
import { useToast } from '../../../components/ToastProvider';
import {
    DndContext,
    closestCenter,
    pointerWithin,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    PlusIcon,
    PhotoIcon,
    Bars3BottomLeftIcon,
    TrashIcon,
    ArrowLeftIcon,
    CheckIcon,
    ArrowsUpDownIcon,
    ShoppingBagIcon,
    MegaphoneIcon,
    DocumentTextIcon,
    EyeIcon,
    XMarkIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ChevronLeftIcon,
    CodeBracketIcon,
    ClipboardDocumentIcon,
    PencilSquareIcon,
    BoldIcon,
    ItalicIcon,
    H1Icon,
    H2Icon,
    H3Icon,
    UserCircleIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';

// --- Helper Components ---

function RangeControl({ label, value, onChange, min = 0, max = 100, step = 1 }) {
    return (
        <div className="mb-4">
            <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <span className="text-sm text-gray-500">{value}%</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
        </div>
    );
}

function Input({ label, value, onChange, placeholder }) {
    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={placeholder}
            />
        </div>
    );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={placeholder}
            />
        </div>
    );
}

function Select({ label, value, onChange, options }) {
    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

function ImageUpload({ url, onChange, widgetId, label = "Obrázek" }) {
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

// --- Properties Panel Components ---

function TextProperties({ block, onChange }) {
    return (
        <>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Styl textu</label>
                <div className="flex gap-2 mb-2">
                    <button
                        onClick={() => onChange({ ...block, tag: 'p' })}
                        className={`p-2 rounded border ${block.tag === 'p' || !block.tag ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700'}`}
                        title="Normal Text"
                    >
                        <span className="text-sm font-bold">T</span>
                    </button>
                    <button
                        onClick={() => onChange({ ...block, tag: 'h1' })}
                        className={`p-2 rounded border ${block.tag === 'h1' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700'}`}
                        title="Heading 1"
                    >
                        <span className="text-sm font-bold">H1</span>
                    </button>
                    <button
                        onClick={() => onChange({ ...block, tag: 'h2' })}
                        className={`p-2 rounded border ${block.tag === 'h2' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700'}`}
                        title="Heading 2"
                    >
                        <span className="text-sm font-bold">H2</span>
                    </button>
                    <button
                        onClick={() => onChange({ ...block, tag: 'h3' })}
                        className={`p-2 rounded border ${block.tag === 'h3' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700'}`}
                        title="Heading 3"
                    >
                        <span className="text-sm font-bold">H3</span>
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onChange({ ...block, bold: !block.bold })}
                        className={`p-2 rounded border ${block.bold ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700'}`}
                        title="Bold"
                    >
                        <BoldIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onChange({ ...block, italic: !block.italic })}
                        className={`p-2 rounded border ${block.italic ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-white border-gray-300 text-gray-700'}`}
                        title="Italic"
                    >
                        <ItalicIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <Select
                label="Font"
                value={block.font || 'system-ui'}
                onChange={(val) => onChange({ ...block, font: val })}
                options={[
                    { value: 'system-ui', label: 'System UI (Default)' },
                    { value: 'Arial, sans-serif', label: 'Arial' },
                    { value: 'Georgia, serif', label: 'Georgia' },
                    { value: 'Courier New, monospace', label: 'Courier New' },
                ]}
            />

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

function ImageProperties({ block, onChange, widgetId }) {
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

function WrapProperties({ block, onChange, widgetId }) {
    return (
        <>
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
            <TextArea
                label="Text"
                value={block.text}
                onChange={(val) => onChange({ ...block, text: val })}
                placeholder="Text obtékající obrázek..."
                rows={6}
            />
        </>
    );
}

function BannerProperties({ block, onChange }) {
    return (
        <>
            <Input
                label="Text banneru"
                value={block.content}
                onChange={(val) => onChange({ ...block, content: val })}
                placeholder="NADPIS SEKCE"
            />
            <Input
                label="Barva pozadí"
                value={block.bgColor || '#f3f4f6'}
                onChange={(val) => onChange({ ...block, bgColor: val })}
                placeholder="#f3f4f6"
            />
            <Input
                label="Barva textu"
                value={block.textColor || '#111827'}
                onChange={(val) => onChange({ ...block, textColor: val })}
                placeholder="#111827"
            />
        </>
    );
}

function ProductProperties({ block, onChange, widgetId }) {
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
                    className={`flex-1 py-1 text-sm font-medium rounded-md transition ${mode === 'manual' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    onClick={() => setMode('manual')}
                >
                    Manuálně
                </button>
                <button
                    className={`flex-1 py-1 text-sm font-medium rounded-md transition ${mode === 'search' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
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
                            className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-9">
                                <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                            </div>
                        )}

                        {showResults && searchResults.length > 0 && (
                            <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                {searchResults.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => selectProduct(product)}
                                        className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center gap-3"
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
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barva tlačítka</label>
                <div className="flex gap-2">
                    <input
                        type="color"
                        value={block.btnColor || '#4f46e5'}
                        onChange={(e) => onChange({ ...block, btnColor: e.target.value })}
                        className="h-9 w-14 p-1 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={block.btnColor || '#4f46e5'}
                        onChange={(e) => onChange({ ...block, btnColor: e.target.value })}
                        className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        placeholder="#4f46e5"
                    />
                </div>
            </div>
        </>
    );
}

function AuthorProperties({ block, onChange, widgetId }) {
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
    }, [mode]);

    const handleAuthorSelect = (authorId) => {
        setSelectedAuthorId(authorId);
        const author = authors.find(a => a.id === authorId);
        if (author) {
            onChange({
                ...block,
                authorName: author.authorName || '',
                authorTitle: author.authorTitle || '',
                authorBio: author.authorBio || '',
                authorPhotoUrl: author.authorPhotoUrl || ''
            });
        }
    };

    return (
        <>
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
                <button
                    className={`flex-1 py-1 text-sm font-medium rounded-md transition ${mode === 'manual' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    onClick={() => setMode('manual')}
                >
                    Manuálně
                </button>
                <button
                    className={`flex-1 py-1 text-sm font-medium rounded-md transition ${mode === 'select' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                    onClick={() => setMode('select')}
                >
                    Vybrat autora
                </button>
            </div>

            {mode === 'select' && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vybrat autora</label>
                    <select
                        value={selectedAuthorId}
                        onChange={(e) => handleAuthorSelect(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    >
                        <option value="">Vyberte autora...</option>
                        {authors.map(author => (
                            <option key={author.id} value={author.id}>{author.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <Input
                label="Jméno autora"
                value={block.authorName}
                onChange={(val) => onChange({ ...block, authorName: val })}
                placeholder="Jan Novák"
            />
            <Input
                label="Titulek / Pozice"
                value={block.authorTitle}
                onChange={(val) => onChange({ ...block, authorTitle: val })}
                placeholder="Redaktor"
            />
            <TextArea
                label="Bio"
                value={block.authorBio}
                onChange={(val) => onChange({ ...block, authorBio: val })}
                placeholder="Krátký popis autora..."
                rows={3}
            />
            <ImageUpload
                label="Foto autora"
                url={block.authorPhotoUrl}
                onChange={(url) => onChange({ ...block, authorPhotoUrl: url })}
                widgetId={widgetId}
            />
        </>
    );
}

// --- Draggable Palette Item ---

function DraggablePaletteItem({ type, icon: Icon, label, onClick }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette-${type}`,
        data: { type, isPaletteItem: true }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 
                border border-gray-200 dark:border-gray-700 rounded-lg transition group text-left cursor-grab active:cursor-grabbing
                ${isDragging ? 'opacity-50' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}
            `}
        >
            <Icon className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {label}
            </span>
        </div>
    );
}

// --- Canvas Components ---

function CanvasBlock({ id, block, isSelected, onClick, onDelete, onChange, activeDragItem }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isOver,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    // Auto-resize textarea
    const adjustHeight = (el) => {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    };

    // Render content based on block type
    const renderContent = () => {
        const margin = { marginBottom: `${block.margin || 24}px` };

        if (block.type === 'text') {
            const Tag = block.tag || 'p';
            const baseFontSize = Tag === 'h1' ? '2em' : Tag === 'h2' ? '1.5em' : Tag === 'h3' ? '1.17em' : '1em';
            const fontWeight = Tag.startsWith('h') ? 'bold' : (block.bold ? 'bold' : 'normal');

            const styles = {
                fontWeight: fontWeight,
                fontStyle: block.italic ? 'italic' : 'normal',
                fontFamily: block.font || 'inherit',
                textAlign: block.align || 'left',
                fontSize: baseFontSize,
                margin: 0,
                color: '#374151',
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                lineHeight: 1.5,
                minHeight: '1.5em'
            };

            return (
                <textarea
                    value={block.content || ''}
                    onChange={(e) => {
                        onChange({ ...block, content: e.target.value });
                        adjustHeight(e.target);
                    }}
                    onFocus={(e) => adjustHeight(e.target)}
                    style={styles}
                    placeholder="Klikněte a pište..."
                    ref={(el) => { if (el) adjustHeight(el); }}
                    onClick={(e) => e.stopPropagation()} // Prevent selecting block when clicking text
                />
            );
        }
        if (block.type === 'image') {
            return (
                <div style={{ textAlign: block.align || 'center' }}>
                    {block.url ? (
                        <img src={resolveImageUrl(block.url)} style={{ width: `${block.width}%`, maxWidth: '100%', borderRadius: '8px', display: 'inline-block' }} alt="" />
                    ) : (
                        <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-400">Vyberte obrázek v nastavení</div>
                    )}
                </div>
            );
        }
        if (block.type === 'wrap') {
            return (
                <div className="clearfix">
                    {block.imgUrl && (
                        <img
                            src={resolveImageUrl(block.imgUrl)}
                            style={{
                                width: `${block.imgWidth}%`,
                                float: block.imgPos || 'right',
                                margin: block.imgPos === 'left' ? '0 24px 16px 0' : '0 0 16px 24px',
                                borderRadius: '8px'
                            }}
                            alt=""
                        />
                    )}
                    <textarea
                        value={block.text || ''}
                        onChange={(e) => {
                            onChange({ ...block, text: e.target.value });
                            adjustHeight(e.target);
                        }}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            overflow: 'hidden',
                            fontFamily: 'inherit',
                            fontSize: '1em',
                            color: '#374151',
                            lineHeight: 1.6
                        }}
                        ref={(el) => { if (el) adjustHeight(el); }}
                        placeholder="Klikněte a pište..."
                    />
                    <div style={{ clear: 'both' }}></div>
                </div>
            );
        }
        if (block.type === 'banner') {
            return (
                <div style={{
                    background: block.bgColor || '#f3f4f6',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    borderLeft: '4px solid #4f46e5'
                }}>
                    <input
                        value={block.content || ''}
                        onChange={(e) => onChange({ ...block, content: e.target.value })}
                        style={{
                            color: block.textColor || '#111827',
                            margin: 0,
                            textTransform: 'uppercase',
                            fontSize: '18px',
                            fontWeight: 700,
                            background: 'transparent',
                            border: 'none',
                            textAlign: 'center',
                            width: '100%',
                            outline: 'none'
                        }}
                        placeholder="NADPIS SEKCE"
                    />
                </div>
            );
        }
        if (block.type === 'product') {
            return (
                <div style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    maxWidth: '400px',
                    margin: '0 auto'
                }}>
                    {block.imgUrl && <img src={resolveImageUrl(block.imgUrl)} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px', display: 'block', margin: '0 auto 16px auto' }} alt="" />}
                    <input
                        value={block.name || ''}
                        onChange={(e) => onChange({ ...block, name: e.target.value })}
                        style={{
                            color: '#111827', margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600,
                            background: 'transparent', border: 'none', textAlign: 'center', width: '100%', outline: 'none'
                        }}
                        placeholder="Název produktu"
                    />
                    {block.price && <p style={{ color: '#059669', fontWeight: 'bold', marginBottom: '16px' }}>{block.price}</p>}
                    <span style={{
                        background: block.btnColor || '#4f46e5',
                        color: 'white',
                        padding: '10px 24px',
                        borderRadius: '6px',
                        fontWeight: 500,
                        display: 'inline-block'
                    }}>
                        {block.btnText || 'Koupit'}
                    </span>
                </div>
            );
        }
        if (block.type === 'author') {
            return (
                <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    {block.authorPhotoUrl ? (
                        <img
                            src={resolveImageUrl(block.authorPhotoUrl)}
                            alt={block.authorName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                            <UserCircleIcon className="w-10 h-10" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg m-0 leading-tight">{block.authorName || 'Jméno autora'}</h3>
                        {block.authorTitle && <p className="text-indigo-600 font-medium text-sm m-0 mb-1">{block.authorTitle}</p>}
                        {block.authorBio && <p className="text-gray-600 text-sm m-0 leading-snug">{block.authorBio}</p>}
                    </div>
                </div>
            );
        }
        return null;
    };

    const showDropIndicator = isOver && activeDragItem?.data?.current?.isPaletteItem;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`
                relative group mb-6 p-4 pl-10 rounded-xl transition-all duration-200
                ${isSelected
                    ? 'ring-2 ring-indigo-500 bg-white shadow-md z-10'
                    : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                }
                ${isDragging ? 'opacity-50' : 'opacity-100'}
            `}
        >
            {/* Drop Indicator */}
            {showDropIndicator && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 z-10 rounded-full transform -translate-y-1/2" />
            )}

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-4 left-2 p-1 cursor-move text-gray-300 hover:text-gray-600 transition touch-none"
                title="Přesunout blok"
            >
                <ArrowsUpDownIcon className="h-5 w-5" />
            </div>

            {renderContent()}

            {/* Delete Button (visible on hover or selected) */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className={`
                    absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full shadow-lg transition-opacity
                    ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                `}
                title="Odstranit blok"
            >
                <TrashIcon className="h-4 w-4" />
            </button>
        </div>
    );
}

function BottomDropZone({ activeDragItem }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'bottom-drop-zone',
    });

    const isPaletteItem = activeDragItem?.data?.current?.isPaletteItem;

    if (!isPaletteItem) return null;

    return (
        <div
            ref={setNodeRef}
            className="h-12 w-full mt-2 relative flex items-center justify-center"
        >
            {isOver && (
                <div className="absolute left-0 right-0 h-1 bg-indigo-500 rounded-full" />
            )}
        </div>
    );
}

// --- Main Page Component ---

export default function ArticleEditorPage({ params }) {
    const { id } = use(params);
    const [widget, setWidget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');
    const showNotification = useToast();

    const [activeDragItem, setActiveDragItem] = useState(null); // Track active drag item for Overlay

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { setNodeRef: setCanvasRef } = useDroppable({
        id: 'canvas-container',
    });

    useEffect(() => {
        fetchWidget();
    }, [id]);

    const fetchWidget = async () => {
        try {
            const res = await authorizedFetch(`/article-widgets/${id}`);
            if (res.ok) {
                const data = await res.json();
                const contentWithIds = (data.content || []).map(block => ({
                    ...block,
                    id: block.id || crypto.randomUUID()
                }));
                setWidget({ ...data, content: contentWithIds });
                setEditNameValue(data.name);
            } else {
                showNotification('Nepodařilo se načíst widget', 'error');
            }
        } catch (error) {
            console.error('Error fetching widget:', error);
            showNotification('Chyba při načítání widgetu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const saveWidget = async (silent = false) => {
        if (!silent) setSaving(true);
        try {
            const res = await authorizedFetch(`/article-widgets/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: isEditingName ? editNameValue : widget.name,
                    content: widget.content,
                }),
            });

            if (res.ok) {
                if (!silent) {
                    showNotification('Změny byly uloženy', 'success');
                    setIsEditingName(false);
                    setWidget(prev => ({ ...prev, name: isEditingName ? editNameValue : prev.name }));
                }
            } else {
                showNotification('Nepodařilo se uložit změny', 'error');
            }
        } catch (error) {
            console.error('Error saving widget:', error);
            showNotification('Chyba při ukládání', 'error');
        } finally {
            if (!silent) setSaving(false);
        }
    };

    // Auto-save on content change (debounced)
    useEffect(() => {
        if (!widget) return;
        const timeoutId = setTimeout(() => {
            saveWidget(true);
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [widget]);

    const createNewBlock = (type) => {
        let newBlock = {
            id: crypto.randomUUID(),
            type,
            margin: 24,
        };

        if (type === 'text') { newBlock.content = 'Nový textový blok'; newBlock.tag = 'p'; }
        if (type === 'image') { newBlock.url = ''; newBlock.width = 100; newBlock.align = 'center'; }
        if (type === 'wrap') { newBlock.text = 'Text s obtékáním'; newBlock.imgUrl = ''; newBlock.imgWidth = 40; newBlock.imgPos = 'right'; }
        if (type === 'banner') { newBlock.content = 'NADPIS SEKCE'; newBlock.bgColor = '#f3f4f6'; newBlock.textColor = '#111827'; }
        if (type === 'product') { newBlock.name = 'Nový produkt'; newBlock.link = ''; newBlock.imgUrl = ''; newBlock.price = ''; newBlock.btnText = 'Koupit'; }

        return newBlock;
    };

    const addBlock = (type) => {
        const newBlock = createNewBlock(type);
        setWidget(prev => ({ ...prev, content: [...prev.content, newBlock] }));
        setSelectedBlockId(newBlock.id); // Auto-select new block
    };

    const updateBlock = (updatedBlock) => {
        setWidget(prev => ({
            ...prev,
            content: prev.content.map(b => b.id === updatedBlock.id ? updatedBlock : b)
        }));
    };

    const deleteBlock = (blockId) => {
        setWidget(prev => ({
            ...prev,
            content: prev.content.filter(b => b.id !== blockId)
        }));
        if (selectedBlockId === blockId) setSelectedBlockId(null);
    };

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveDragItem(active);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        // Handle drop from Palette
        if (active.data.current?.isPaletteItem) {
            const type = active.data.current.type;
            const newBlock = createNewBlock(type);

            setWidget((prev) => {
                const overIndex = prev.content.findIndex((b) => b.id === over.id);
                let newContent = [...prev.content];

                if (overIndex >= 0) {
                    // Insert before the hovered item
                    newContent.splice(overIndex, 0, newBlock);
                } else if (over.id === 'bottom-drop-zone' || over.id === 'canvas-container') {
                    // Append to end
                    newContent.push(newBlock);
                }

                return { ...prev, content: newContent };
            });

            setSelectedBlockId(newBlock.id); // Select the new block
            return;
        }

        // Handle reordering
        if (active.id !== over.id) {
            setWidget((prev) => {
                const oldIndex = prev.content.findIndex((b) => b.id === active.id);
                const newIndex = prev.content.findIndex((b) => b.id === over.id);

                return {
                    ...prev,
                    content: arrayMove(prev.content, oldIndex, newIndex),
                };
            });
        }
    };

    const generateEmbedCode = () => {
        const embedUrl = `${process.env.NEXT_PUBLIC_API_URL}/article-widgets/${id}/embed.js`;
        return `<script src="${embedUrl}" async></script>`;
    };

    const copyEmbedCode = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        showNotification('Kód zkopírován do schránky', 'success');
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Načítám...</div>;
    if (!widget) return <div className="p-8 text-center text-red-500">Widget nenalezen</div>;

    const selectedBlock = widget.content.find(b => b.id === selectedBlockId);

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 flex-shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/widgets/article" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                        <ChevronLeftIcon className="h-5 w-5" />
                    </Link>
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="text-lg font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-indigo-500 focus:outline-none"
                                autoFocus
                            />
                            <button onClick={() => saveWidget(false)} className="p-1 text-green-600 hover:text-green-700 transition cursor-pointer">
                                <CheckIcon className="h-6 w-6" />
                            </button>
                            <button onClick={() => { setIsEditingName(false); setEditNameValue(widget.name); }} className="p-1 text-red-600 hover:text-red-700 transition cursor-pointer">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{widget.name}</h1>
                            <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition p-1 text-gray-400 hover:text-indigo-600 cursor-pointer">
                                <PencilSquareIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowEmbedModal(true)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer">
                        <CodeBracketIcon className="h-5 w-5" />
                        Embed kód
                    </button>
                    <button onClick={() => saveWidget(false)} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                        {saving ? 'Ukládám...' : <><CheckIcon className="h-5 w-5" /> Uložit změny</>}
                    </button>
                </div>
            </div>

            {/* Main Content - 3 Column Layout */}
            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex overflow-hidden">

                    {/* Left Sidebar: Palette */}
                    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bloky</h2>
                        </div>
                        <div className="p-4 space-y-3">
                            <DraggablePaletteItem type="text" icon={Bars3BottomLeftIcon} label="Text" onClick={() => addBlock('text')} />
                            <DraggablePaletteItem type="image" icon={PhotoIcon} label="Obrázek" onClick={() => addBlock('image')} />
                            <DraggablePaletteItem type="wrap" icon={DocumentTextIcon} label="Obtékání" onClick={() => addBlock('wrap')} />
                            <DraggablePaletteItem type="banner" icon={MegaphoneIcon} label="Banner" onClick={() => addBlock('banner')} />
                            <DraggablePaletteItem type="product" icon={ShoppingBagIcon} label="Produkt" onClick={() => addBlock('product')} />
                            <DraggablePaletteItem type="author" icon={UserCircleIcon} label="Autor" onClick={() => addBlock('author')} />
                        </div>
                    </div>

                    {/* Center: Canvas */}
                    <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-8 flex justify-center items-start" onClick={() => setSelectedBlockId(null)}>
                        <div ref={setCanvasRef} className="w-full max-w-3xl bg-white min-h-[800px] shadow-lg rounded-xl p-8" onClick={() => setSelectedBlockId(null)}>
                            <SortableContext
                                items={widget.content.map(b => b.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {widget.content.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-12">
                                        <PlusIcon className="h-12 w-12 mb-4 opacity-50" />
                                        <p>Přetáhněte sem bloky z levého menu</p>
                                    </div>
                                ) : (
                                    widget.content.map(block => (
                                        <CanvasBlock
                                            key={block.id}
                                            id={block.id}
                                            block={block}
                                            isSelected={selectedBlockId === block.id}
                                            onClick={() => setSelectedBlockId(block.id)}
                                            onDelete={() => deleteBlock(block.id)}
                                            onChange={updateBlock}
                                            activeDragItem={activeDragItem}
                                        />
                                    ))
                                )}
                            </SortableContext>
                            <BottomDropZone activeDragItem={activeDragItem} />
                        </div>
                    </div>

                    {/* Right Sidebar: Properties */}
                    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {selectedBlock ? 'Nastavení bloku' : 'Vlastnosti'}
                            </h2>
                        </div>
                        <div className="p-4">
                            {selectedBlock ? (
                                <>
                                    {selectedBlock.type === 'text' && <TextProperties block={selectedBlock} onChange={updateBlock} />}
                                    {selectedBlock.type === 'image' && <ImageProperties block={selectedBlock} onChange={updateBlock} widgetId={id} />}
                                    {selectedBlock.type === 'wrap' && <WrapProperties block={selectedBlock} onChange={updateBlock} widgetId={id} />}
                                    {selectedBlock.type === 'banner' && <BannerProperties block={selectedBlock} onChange={updateBlock} />}
                                    {selectedBlock.type === 'product' && <ProductProperties block={selectedBlock} onChange={updateBlock} widgetId={id} />}
                                    {selectedBlock.type === 'author' && (
                                        <AuthorProperties block={selectedBlock} onChange={updateBlock} widgetId={id} />
                                    )}

                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Odsazení (margin)
                                        </label>
                                        <input
                                            type="range"
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            value={selectedBlock.margin || 24}
                                            onChange={(e) => updateBlock({ ...selectedBlock, margin: parseInt(e.target.value) })}
                                            min={0}
                                            max={100}
                                            step={4}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-400 py-12">
                                    <p>Vyberte blok v náhledu pro zobrazení jeho nastavení.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeDragItem ? (
                        activeDragItem.data.current?.isPaletteItem ? (
                            <div className="p-3 bg-white border border-indigo-500 rounded-lg shadow-xl opacity-90 w-48 flex items-center gap-3">
                                <span className="font-medium text-indigo-600">Nový blok</span>
                            </div>
                        ) : (
                            <div className="p-4 bg-white border border-indigo-500 rounded-xl shadow-xl opacity-90 w-full max-w-2xl">
                                <span className="text-gray-500">Přesouvání...</span>
                            </div>
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Embed Modal */}
            {showEmbedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowEmbedModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Embed kód</h2>
                            <button onClick={() => setShowEmbedModal(false)} className="text-gray-400 hover:text-gray-500 cursor-pointer">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Vložte tento kód do vašich stránek tam, kde chcete zobrazit článek.
                        </p>
                        <div className="relative">
                            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-all">
                                {generateEmbedCode()}
                            </pre>
                            <button onClick={copyEmbedCode} className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 transition cursor-pointer" title="Zkopírovat">
                                <ClipboardDocumentIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowEmbedModal(false)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer">
                                Zavřít
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
