'use strict';
'use client';

import { useState, useEffect, use } from 'react';
import { authorizedFetch, authorizedUpload } from '../../../../lib/api';
import { useToast } from '../../../components/ToastProvider';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
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
    PencilSquareIcon
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

// --- Block Components ---

function TextBlock({ block, onChange }) {
    return (
        <TextArea
            value={block.content}
            onChange={(val) => onChange({ ...block, content: val })}
            placeholder="Zde napište svůj text..."
            rows={5}
        />
    );
}

function ImageBlock({ block, onChange, widgetId }) {
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
        </>
    );
}

function TextWrapBlock({ block, onChange, widgetId }) {
    return (
        <>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pozice obrázku</label>
                <select
                    value={block.imgPos || 'right'}
                    onChange={(e) => onChange({ ...block, imgPos: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    <option value="left">Vlevo</option>
                    <option value="right">Vpravo</option>
                </select>
            </div>
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

function BannerBlock({ block, onChange }) {
    return (
        <Input
            label="Text banneru"
            value={block.content}
            onChange={(val) => onChange({ ...block, content: val })}
            placeholder="NADPIS SEKCE"
        />
    );
}

function ProductBlock({ block, onChange, widgetId }) {
    return (
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
                label="Odkaz na produkt"
                value={block.link}
                onChange={(val) => onChange({ ...block, link: val })}
                placeholder="https://..."
            />
        </>
    );
}

// --- Sortable Item Wrapper ---

function SortableBlock({ id, block, onChange, onDelete, widgetId }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getBlockIcon = (type) => {
        switch (type) {
            case 'text': return <Bars3BottomLeftIcon className="h-5 w-5" />;
            case 'image': return <PhotoIcon className="h-5 w-5" />;
            case 'wrap': return <DocumentTextIcon className="h-5 w-5" />;
            case 'banner': return <MegaphoneIcon className="h-5 w-5" />;
            case 'product': return <ShoppingBagIcon className="h-5 w-5" />;
            default: return <Bars3BottomLeftIcon className="h-5 w-5" />;
        }
    };

    const getBlockLabel = (type) => {
        switch (type) {
            case 'text': return 'Text';
            case 'image': return 'Obrázek';
            case 'wrap': return 'Text s obtékáním';
            case 'banner': return 'Banner';
            case 'product': return 'Produkt';
            default: return 'Blok';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-4 group overflow-hidden"
        >
            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-move p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <ArrowsUpDownIcon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <span className="text-indigo-500 dark:text-indigo-400">{getBlockIcon(block.type)}</span>
                        {getBlockLabel(block.type)}
                    </span>
                </div>
                <button
                    onClick={onDelete}
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
            <div className="p-4">
                {block.type === 'text' && <TextBlock block={block} onChange={onChange} />}
                {block.type === 'image' && <ImageBlock block={block} onChange={onChange} widgetId={widgetId} />}
                {block.type === 'wrap' && <TextWrapBlock block={block} onChange={onChange} widgetId={widgetId} />}
                {block.type === 'banner' && <BannerBlock block={block} onChange={onChange} />}
                {block.type === 'product' && <ProductBlock block={block} onChange={onChange} widgetId={widgetId} />}
            </div>
        </div>
    );
}

// --- Live Preview Component ---

function LivePreview({ widget }) {
    const styles = `
    .bnnr_article_wrapper {
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 100%;
        margin: 0 auto;
        color: #374151;
        line-height: 1.6;
        box-sizing: border-box;
    }
    .bnnr_article_title {
        text-align: center;
        color: #111827;
        font-size: 28px;
        margin-bottom: 32px;
        font-weight: 700;
    }
    .bnnr_block {
        margin-bottom: 24px;
    }
    .bnnr_text {
        font-size: 16px;
        color: #374151;
        margin: 0;
    }
    .bnnr_img_container {
        text-align: center;
    }
    .bnnr_img {
        border-radius: 8px;
        max-width: 100%;
        height: auto;
    }
    .bnnr_wrap_container {
        width: 100%;
        overflow: hidden;
    }
    .bnnr_wrap_img {
        border-radius: 8px;
        margin-bottom: 16px;
        max-width: 100%;
        height: auto;
    }
    .bnnr_float_left {
        float: left;
        margin-right: 24px;
    }
    .bnnr_float_right {
        float: right;
        margin-left: 24px;
    }
    .bnnr_banner {
        background: #f3f4f6;
        padding: 24px;
        border-radius: 12px;
        text-align: center;
        border-left: 4px solid #4f46e5;
    }
    .bnnr_banner_text {
        color: #111827;
        margin: 0;
        text-transform: uppercase;
        font-size: 18px;
        font-weight: 700;
    }
    .bnnr_product {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        padding: 24px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }
    .bnnr_product_img {
        width: 120px;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 16px;
    }
    .bnnr_product_name {
        color: #111827;
        margin: 0 0 16px 0;
        font-size: 18px;
        font-weight: 600;
    }
    .bnnr_product_btn {
        background: #4f46e5;
        color: white !important;
        padding: 10px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 500;
        display: inline-block;
        transition: background-color 0.2s;
    }
    .bnnr_product_btn:hover {
        background: #4338ca;
    }
    .bnnr_clearfix::after {
        content: "";
        clear: both;
        display: table;
    }
    
    @media(max-width: 768px) {
        .bnnr_wrap_img {
            float: none !important;
            width: 100% !important;
            margin: 0 0 16px 0 !important;
            display: block !important;
        }
    }
  `;

    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-[calc(100vh-180px)] overflow-y-auto p-8">
            <style>{styles}</style>
            <div className="bnnr_article_wrapper">
                <div className="bnnr_article_inner">
                    {/* <h1 className="bnnr_article_title">{widget.name}</h1> */}

                    {widget.content.map(block => {
                        const margin = { marginBottom: `${block.margin || 24}px` };

                        if (block.type === 'text') {
                            return (
                                <p key={block.id} className="bnnr_text" style={margin}>
                                    {(block.content || '').split('\n').map((line, i) => (
                                        <span key={i}>{line}<br /></span>
                                    ))}
                                </p>
                            );
                        }
                        if (block.type === 'image') {
                            return (
                                <div key={block.id} className="bnnr_img_container" style={margin}>
                                    {block.url && <img src={resolveImageUrl(block.url)} style={{ width: `${block.width}%` }} className="bnnr_img" alt="" />}
                                </div>
                            );
                        }
                        if (block.type === 'wrap') {
                            const floatClass = block.imgPos === 'left' ? 'bnnr_float_left' : 'bnnr_float_right';
                            return (
                                <div key={block.id} className="bnnr_wrap_container bnnr_clearfix" style={margin}>
                                    {block.imgUrl && (
                                        <img
                                            src={resolveImageUrl(block.imgUrl)}
                                            className={`bnnr_wrap_img ${floatClass}`}
                                            style={{ width: `${block.imgWidth}%` }}
                                            alt=""
                                        />
                                    )}
                                    <p className="bnnr_text">
                                        {(block.text || '').split('\n').map((line, i) => (
                                            <span key={i}>{line}<br /></span>
                                        ))}
                                    </p>
                                </div>
                            );
                        }
                        if (block.type === 'banner') {
                            return (
                                <div key={block.id} className="bnnr_banner" style={margin}>
                                    <h2 className="bnnr_banner_text">{block.content}</h2>
                                </div>
                            );
                        }
                        if (block.type === 'product') {
                            return (
                                <div key={block.id} className="bnnr_product" style={margin}>
                                    {block.imgUrl && <img src={resolveImageUrl(block.imgUrl)} className="bnnr_product_img" alt="" />}
                                    <h3 className="bnnr_product_name">{block.name}</h3>
                                    {block.link && (
                                        <a href={block.link} target="_blank" rel="noopener noreferrer" className="bnnr_product_btn">
                                            Koupit
                                        </a>
                                    )}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}

// --- Main Page Component ---

export default function ArticleEditorPage({ params }) {
    const { id } = use(params);
    const [widget, setWidget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');
    const showNotification = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    const addBlock = (type) => {
        let newBlock = {
            id: crypto.randomUUID(),
            type,
            margin: 30,
        };

        if (type === 'text') newBlock.content = '';
        if (type === 'image') { newBlock.url = ''; newBlock.width = 100; }
        if (type === 'wrap') { newBlock.text = ''; newBlock.imgUrl = ''; newBlock.imgWidth = 40; newBlock.imgPos = 'right'; }
        if (type === 'banner') newBlock.content = 'NADPIS SEKCE';
        if (type === 'product') { newBlock.name = 'Nový produkt'; newBlock.link = ''; newBlock.imgUrl = ''; }

        setWidget({ ...widget, content: [...widget.content, newBlock] });
    };

    const updateBlock = (updatedBlock) => {
        const newContent = widget.content.map((b) =>
            b.id === updatedBlock.id ? updatedBlock : b
        );
        setWidget({ ...widget, content: newContent });
    };

    const deleteBlock = (blockId) => {
        setWidget({
            ...widget,
            content: widget.content.filter((b) => b.id !== blockId),
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

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
        return `<script src="${embedUrl}"></script>`;
    };

    const copyEmbedCode = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        showNotification('Kód zkopírován do schránky', 'success');
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Načítám...</div>;
    }

    if (!widget) {
        return <div className="p-8 text-center text-red-500">Widget nenalezen</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/widgets/article"
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                        >
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
                                <button
                                    onClick={() => saveWidget(false)}
                                    className="p-1 text-green-600 hover:text-green-700 transition cursor-pointer"
                                    title="Uložit název"
                                >
                                    <CheckIcon className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingName(false);
                                        setEditNameValue(widget.name);
                                    }}
                                    className="p-1 text-red-600 hover:text-red-700 transition cursor-pointer"
                                    title="Zrušit"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{widget.name}</h1>
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="opacity-0 group-hover:opacity-100 transition p-1 text-gray-400 hover:text-indigo-600 cursor-pointer"
                                    title="Upravit název"
                                >
                                    <PencilSquareIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowEmbedModal(true)}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer"
                        >
                            <CodeBracketIcon className="h-5 w-5" />
                            Embed kód
                        </button>
                        <button
                            onClick={() => saveWidget(false)}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {saving ? (
                                'Ukládám...'
                            ) : (
                                <>
                                    <CheckIcon className="h-5 w-5" />
                                    Uložit změny
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Left Column: Editor */}
                <div className="space-y-8">
                    {/* Add Block Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        <button
                            onClick={() => addBlock('text')}
                            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition group"
                        >
                            <Bars3BottomLeftIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 mb-1" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                Text
                            </span>
                        </button>
                        <button
                            onClick={() => addBlock('image')}
                            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition group"
                        >
                            <PhotoIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 mb-1" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                Obrázek
                            </span>
                        </button>
                        <button
                            onClick={() => addBlock('wrap')}
                            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition group"
                        >
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 mb-1" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                Obtékání
                            </span>
                        </button>
                        <button
                            onClick={() => addBlock('banner')}
                            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition group"
                        >
                            <MegaphoneIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 mb-1" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                Banner
                            </span>
                        </button>
                        <button
                            onClick={() => addBlock('product')}
                            className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition group"
                        >
                            <ShoppingBagIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 mb-1" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                Produkt
                            </span>
                        </button>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={widget.content.map((b) => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {widget.content.map((block) => (
                                <SortableBlock
                                    key={block.id}
                                    id={block.id}
                                    block={block}
                                    onChange={updateBlock}
                                    onDelete={() => deleteBlock(block.id)}
                                    widgetId={widget.id}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {widget.content.length === 0 && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                            <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">Začněte přidáním prvního bloku obsahu.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Live Preview */}
                <div className="lg:sticky lg:top-24 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Živý náhled</h3>
                        <div className="flex gap-2">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <ComputerDesktopIcon className="h-4 w-4" /> Desktop
                            </span>
                        </div>
                    </div>

                    <LivePreview widget={widget} />

                </div>

            </div>

            {/* Embed Code Modal */}
            {showEmbedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100">
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
                            <button
                                onClick={copyEmbedCode}
                                className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 transition cursor-pointer"
                                title="Zkopírovat"
                            >
                                <ClipboardDocumentIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowEmbedModal(false)}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                            >
                                Zavřít
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
