import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
    UserCircleIcon,
    TrashIcon,
    ArrowsUpDownIcon,
    PlusIcon,
    Bars3BottomLeftIcon,
    PhotoIcon,
    TableCellsIcon,
    MegaphoneIcon,
    ShoppingBagIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';
import ContentEditable from './ContentEditable';

const CHILD_BLOCK_TYPES = [
    { type: 'text', label: 'Text', icon: Bars3BottomLeftIcon },
    { type: 'image', label: 'Obrázek', icon: PhotoIcon },
    { type: 'banner', label: 'Banner', icon: MegaphoneIcon },
    { type: 'product', label: 'Produkt', icon: ShoppingBagIcon },
];

function createChildBlock(type) {
    const newBlock = { id: crypto.randomUUID(), type, margin: 12 };
    if (type === 'text') { newBlock.content = 'Nový text'; newBlock.tag = 'p'; }
    if (type === 'image') { newBlock.url = ''; newBlock.width = 100; newBlock.align = 'center'; }
    if (type === 'banner') { newBlock.content = 'NADPIS'; newBlock.bgColor = '#f3f4f6'; newBlock.textColor = '#111827'; }
    if (type === 'product') { newBlock.name = 'Produkt'; newBlock.link = ''; newBlock.imgUrl = ''; newBlock.price = ''; newBlock.btnText = 'Koupit'; }
    return newBlock;
}

function AddBlockMenu({ onAdd, isEmptyState = false }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`relative group/add ${isEmptyState ? 'h-full flex-1 min-h-[140px]' : 'pt-2'}`}>
            {isEmptyState ? (
                <button
                    onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                    className={`w-full h-full flex flex-col items-center justify-center p-4 text-center rounded-xl border-2 border-dashed transition-all
                        ${open
                            ? 'border-visualy-accent-4 bg-visualy-accent-4/15 text-visualy-accent-4'
                            : 'border-gray-200/50 bg-gray-50/30 text-gray-400 hover:border-visualy-accent-4/40 hover:bg-visualy-accent-4/5 hover:text-visualy-accent-4'
                        }`}
                >
                    <div className={`mb-3 p-3 rounded-full transition-all duration-300
                         ${open ? 'bg-visualy-accent-4/20 scale-110' : 'bg-white group-hover/add:bg-visualy-accent-4/20 group-hover/add:scale-110 shadow-sm border border-gray-100'}`}>
                        <PlusIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold mb-1">Přidat obsah</span>
                    <span className="text-[10px] text-gray-400 font-medium">Klikněte pro výběr prvku</span>
                </button>
            ) : (
                <button
                    onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                    className={`w-full h-9 border border-dashed rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-medium 
                        ${open
                            ? 'border-visualy-accent-4 text-visualy-accent-4 bg-visualy-accent-4/10'
                            : 'border-gray-200 text-gray-400 hover:border-visualy-accent-4/40 hover:text-visualy-accent-4 hover:bg-visualy-accent-4/5'
                        }`}
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>Přidat další prvek</span>
                </button>
            )}

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
                    <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 ring-1 ring-black/5 animate-zoom-in flex flex-col gap-1 p-1.5">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Vyberte typ obsahu</span>
                            <span className="bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">ESC</span>
                        </div>
                        {CHILD_BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                            <button
                                key={type}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAdd(type);
                                    setOpen(false);
                                }}
                                className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-visualy-accent-4/10 hover:text-visualy-accent-4 rounded-xl flex items-center gap-3 transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-visualy-accent-4/20 group-hover:text-visualy-accent-4 transition-colors">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold leading-tight">{label}</span>
                                    <span className="text-[10px] text-gray-400 group-hover:text-visualy-accent-4/60 transition-colors">Vložit {label.toLowerCase()} do sloupce</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function DroppableColumn({ columnId, children }) {
    const { setNodeRef, isOver } = useDroppable({ id: columnId });
    const { active } = useDndContext();
    const isPaletteItem = active?.data?.current?.isPaletteItem;
    const showIndicator = isPaletteItem && isOver;

    return (
        <div ref={setNodeRef} className="flex flex-col h-full relative">
            {children}
            {showIndicator && (
                <div className="absolute inset-0 rounded-lg border-2 border-visualy-accent-4/60 bg-visualy-accent-4/10 pointer-events-none z-10 transition-all">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-visualy-accent-4/100 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <PlusIcon className="h-3 w-3" />
                            Vložit sem
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function LayoutChildBlock({ childBlock, isSelected, onClick, onChange, onFormatChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    const renderChildContent = () => {
        if (childBlock.type === 'text') {
            return (
                <ContentEditable
                    tagName="div"
                    html={childBlock.content || ''}
                    onChange={(html) => onChange({ ...childBlock, content: html })}
                    onFormatChange={onFormatChange}
                    style={{ textAlign: childBlock.align || 'left', width: '100%', background: 'transparent', border: 'none', outline: 'none', lineHeight: 1.5, minHeight: '1.5em', fontSize: '14px' }}
                    className="focus:outline-none empty:before:content-[attr(placeholder)] empty:before:text-gray-400 [&>h1]:text-xl [&>h1]:font-bold [&>h2]:text-lg [&>h2]:font-bold [&>h3]:text-base [&>h3]:font-bold [&>p]:mb-1"
                    placeholder="Klikněte a pište..."
                />
            );
        }
        if (childBlock.type === 'image') {
            return (
                <div style={{ textAlign: childBlock.align || 'center' }}>
                    {childBlock.url ? (
                        <img src={resolveImageUrl(childBlock.url)} style={{ width: `${childBlock.width}%`, maxWidth: '100%', borderRadius: '6px', display: 'inline-block' }} alt="" />
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400 text-xs">
                            <PhotoIcon className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                            Vyberte obrázek
                        </div>
                    )}
                </div>
            );
        }
        if (childBlock.type === 'banner') {
            return (
                <div style={{ background: childBlock.bgColor || '#f3f4f6', padding: '16px', borderRadius: '8px', textAlign: 'center', borderLeft: '3px solid #26AD80' }}>
                    <input
                        value={childBlock.content || ''}
                        onChange={(e) => onChange({ ...childBlock, content: e.target.value })}
                        style={{ color: childBlock.textColor || '#111827', textTransform: 'uppercase', fontSize: '14px', fontWeight: 700, background: 'transparent', border: 'none', textAlign: 'center', width: '100%', outline: 'none' }}
                        placeholder="NADPIS"
                    />
                </div>
            );
        }
        if (childBlock.type === 'product') {
            return (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '16px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    {childBlock.imgUrl ? (
                        <img src={resolveImageUrl(childBlock.imgUrl)} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', margin: '0 auto 8px' }} alt="" />
                    ) : (
                        <div className="w-16 h-16 mx-auto mb-2 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                            <ShoppingBagIcon className="h-5 w-5 text-gray-300" />
                        </div>
                    )}
                    <div className="text-sm font-semibold text-gray-900">{childBlock.name || 'Produkt'}</div>
                    {childBlock.price && <div className="text-green-600 font-bold text-xs mt-1">{childBlock.price}</div>}
                    <span style={{ background: childBlock.btnColor || '#26AD80', color: 'white', padding: '6px 16px', borderRadius: '4px', fontSize: '12px', display: 'inline-block', marginTop: '8px' }}>
                        {childBlock.btnText || 'Koupit'}
                    </span>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`relative group/child rounded-lg transition-all duration-150 ${isSelected
                ? 'ring-2 ring-visualy-accent-4 bg-visualy-accent-4/5'
                : 'hover:bg-gray-50 hover:ring-1 hover:ring-gray-200'
                }`}
            style={{ marginBottom: `${childBlock.margin || 12}px`, padding: '6px' }}
        >
            {/* Child block floating toolbar */}
            <div className={`absolute -top-3 right-1 flex items-center gap-0.5 z-20 transition-all duration-150 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 group-hover/child:opacity-100 group-hover/child:translate-y-0'
                }`}>
                <div className="flex items-center bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
                    {!isFirst && (
                        <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-1 text-gray-400 hover:text-visualy-accent-4 hover:bg-visualy-accent-4/10 transition-colors" title="Posunout nahoru">
                            <ChevronUpIcon className="h-3 w-3" />
                        </button>
                    )}
                    {!isLast && (
                        <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-1 text-gray-400 hover:text-visualy-accent-4 hover:bg-visualy-accent-4/10 transition-colors" title="Posunout dolů">
                            <ChevronDownIcon className="h-3 w-3" />
                        </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Odstranit">
                        <TrashIcon className="h-3 w-3" />
                    </button>
                </div>
            </div>
            {renderChildContent()}
        </div>
    );
}

export default function PreviewBlock({ block, isSelected, selectedBlockId, onClick, onSelectBlock, onChange, onFormatChange, onDelete }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver
    } = useSortable({ id: block.id });

    const { active } = useDndContext();
    const isPaletteItem = active?.data?.current?.isPaletteItem;
    const showDropIndicator = isPaletteItem && isOver;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    const renderContent = () => {
        // Margin is now handled by the wrapper padding, so we reset it here for inner content
        const margin = { marginBottom: 0 };

        if (block.type === 'text') {
            const styles = {
                textAlign: block.align || 'left',
                ...margin,
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                lineHeight: 1.5,
                minHeight: '1.5em',
                fontSize: '16px'
            };

            return (
                <ContentEditable
                    tagName="div"
                    html={block.content || ''}
                    onChange={(html) => onChange({ ...block, content: html })}
                    onFormatChange={onFormatChange}
                    style={styles}
                    className="focus:outline-none empty:before:content-[attr(placeholder)] empty:before:text-gray-400 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&>p]:mb-2"
                    placeholder="Klikněte a pište..."
                    onClick={(e) => {
                        if (document.activeElement !== e.currentTarget) {
                            e.currentTarget.focus();
                        }
                    }}
                />
            );
        }
        if (block.type === 'image') {
            return (
                <div style={{ textAlign: block.align || 'center', ...margin }}>
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
                <div className="clearfix" style={margin}>
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
                    <ContentEditable
                        tagName="div"
                        html={block.content || block.text || ''}
                        onChange={(html) => onChange({ ...block, content: html })}
                        onFormatChange={onFormatChange}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            lineHeight: 1.6,
                            minHeight: '1.5em',
                            display: 'block',
                            width: 'auto',
                            overflow: 'visible',
                            fontSize: '16px'
                        }}
                        className="focus:outline-none empty:before:content-[attr(placeholder)] empty:before:text-gray-400 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&>p]:mb-2"
                        placeholder="Klikněte a pište..."
                        onClick={(e) => {
                            if (document.activeElement !== e.currentTarget) {
                                e.currentTarget.focus();
                            }
                        }}
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
                    borderLeft: '4px solid #26AD80',
                    ...margin
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
                    margin: `0 auto ${block.margin !== undefined ? block.margin : 24}px`
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
                    {block.description && (
                        <p style={{
                            color: '#4b5563',
                            fontSize: '14px',
                            lineHeight: '1.4',
                            margin: '0 0 16px 0',
                            display: '-webkit-box',
                            WebkitLineClamp: '3',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {block.description}
                        </p>
                    )}
                    {block.price && <p style={{ color: '#059669', fontWeight: 'bold', marginBottom: '16px' }}>{block.price}</p>}
                    <span style={{
                        background: block.btnColor || '#26AD80',
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
                <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-100" style={margin}>
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
                        {block.authorTitle && <p className="text-visualy-accent-4 font-medium text-sm m-0 mb-1">{block.authorTitle}</p>}
                        {block.authorBio && <p className="text-gray-600 text-sm m-0 leading-snug">{block.authorBio}</p>}
                    </div>
                </div>
            );
        }
        if (block.type === 'table') {
            const borderColor = '#e5e7eb';
            const borderStyle = block.borderStyle || 'full';

            return (
                <div style={{ overflowX: 'auto', ...margin }}>
                    <table style={{
                        width: `${block.width || 100}%`,
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                        border: block.outerBorder !== false ? `1px solid ${borderColor}` : 'none',
                        borderRadius: `${block.borderRadius !== undefined ? block.borderRadius : 8}px`,
                        overflow: 'hidden'
                    }}>
                        <thead>
                            <tr>
                                {(block.header || []).map((head, i) => (
                                    <th key={i} style={{
                                        background: block.headerBgColor || '#f3f4f6',
                                        color: block.headerTextColor || '#111827',
                                        padding: '12px 16px',
                                        textAlign: block.textAlign || 'left',
                                        fontWeight: 600,
                                        borderBottom: borderStyle !== 'none' ? `1px solid ${borderColor}` : 'none',
                                        borderRight: borderStyle === 'full' && i < (block.header.length - 1) ? `1px solid ${borderColor}` : 'none'
                                    }}>
                                        <ContentEditable
                                            tagName="div"
                                            html={head}
                                            onChange={(val) => {
                                                const newHeader = [...block.header];
                                                newHeader[i] = val;
                                                onChange({ ...block, header: newHeader });
                                            }}
                                            style={{ outline: 'none', minWidth: '50px' }}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(block.data || []).map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                        <td key={colIndex} style={{
                                            padding: '12px 16px',
                                            textAlign: block.textAlign || 'left',
                                            borderBottom: borderStyle !== 'none' && rowIndex < (block.data.length - 1) ? `1px solid ${borderColor}` : 'none',
                                            borderRight: borderStyle === 'full' && colIndex < (row.length - 1) ? `1px solid ${borderColor}` : 'none'
                                        }}>
                                            <ContentEditable
                                                tagName="div"
                                                html={cell}
                                                onChange={(val) => {
                                                    const newData = [...block.data];
                                                    newData[rowIndex] = [...newData[rowIndex]]; // Copy row
                                                    newData[rowIndex][colIndex] = val;
                                                    onChange({ ...block, data: newData });
                                                }}
                                                style={{ outline: 'none', minWidth: '50px' }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (block.type === 'layout') {
            const gap = block.gap !== undefined ? block.gap : 16;

            const handleAddChildBlock = (colIndex, type) => {
                const newChild = createChildBlock(type);
                const newColumns = block.columns.map((col, i) => {
                    if (i !== colIndex) return col;
                    return { ...col, blocks: [...(col.blocks || []), newChild] };
                });
                onChange({ ...block, columns: newColumns });
            };

            const handleUpdateChildBlock = (updatedChild) => {
                const newColumns = block.columns.map(col => ({
                    ...col,
                    blocks: (col.blocks || []).map(b => b.id === updatedChild.id ? updatedChild : b)
                }));
                onChange({ ...block, columns: newColumns });
            };

            const handleDeleteChildBlock = (childId) => {
                const newColumns = block.columns.map(col => ({
                    ...col,
                    blocks: (col.blocks || []).filter(b => b.id !== childId)
                }));
                onChange({ ...block, columns: newColumns });
            };

            const handleMoveChildBlock = (colIndex, blockIndex, direction) => {
                const newColumns = [...block.columns];
                const col = { ...newColumns[colIndex], blocks: [...newColumns[colIndex].blocks] };
                const newIndex = blockIndex + direction;
                if (newIndex < 0 || newIndex >= col.blocks.length) return;
                const [moved] = col.blocks.splice(blockIndex, 1);
                col.blocks.splice(newIndex, 0, moved);
                newColumns[colIndex] = col;
                onChange({ ...block, columns: newColumns });
            };

            return (
                <div style={{ display: 'flex', gap: `${gap}px`, ...margin }}>
                    {block.columns.map((col, colIndex) => (
                        <div
                            key={col.id}
                            style={{ width: `${col.width}%`, minHeight: '120px' }}
                            className="group/col relative flex flex-col border border-dashed border-gray-200 rounded-xl p-3 hover:bg-gray-50/50 hover:border-visualy-accent-4/40 transition-all duration-200"
                        >
                            {/* Column label - hidden by default, shown on hover */}
                            <div className="absolute -top-3 left-3 opacity-0 group-hover/col:opacity-100 transition-opacity z-10">
                                <span className="bg-white border border-gray-200 text-[10px] text-gray-500 font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                                    {Math.round(col.width)}%
                                </span>
                            </div>

                            {/* Child blocks area */}
                            <div className="flex-1 flex flex-col h-full">
                                {(col.blocks || []).length === 0 ? (
                                    <AddBlockMenu onAdd={(type) => handleAddChildBlock(colIndex, type)} isEmptyState={true} />
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-2">
                                            {(col.blocks || []).map((childBlock, blockIndex) => (
                                                <LayoutChildBlock
                                                    key={childBlock.id}
                                                    childBlock={childBlock}
                                                    columnBlock={col}
                                                    parentBlock={block}
                                                    isSelected={selectedBlockId === childBlock.id}
                                                    onClick={() => onSelectBlock?.(childBlock.id)}
                                                    onChange={handleUpdateChildBlock}
                                                    onFormatChange={onFormatChange}
                                                    onDelete={() => handleDeleteChildBlock(childBlock.id)}
                                                    onMoveUp={() => handleMoveChildBlock(colIndex, blockIndex, -1)}
                                                    onMoveDown={() => handleMoveChildBlock(colIndex, blockIndex, 1)}
                                                    isFirst={blockIndex === 0}
                                                    isLast={blockIndex === (col.blocks || []).length - 1}
                                                />
                                            ))}
                                        </div>
                                        <AddBlockMenu onAdd={(type) => handleAddChildBlock(colIndex, type)} />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };


    // Calculate dynamic padding based on block margin
    const paddingTop = `${block.margin !== undefined ? block.margin : 24}px`;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative transition-all duration-200"
        >
            {/* Hit Area / Spacing */}
            <div style={{ height: paddingTop }} className="w-full" />

            {/* Drop Indicator - Positioned in the middle of the gap (padding) */}
            {showDropIndicator && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-visualy-accent-4 rounded-full z-50 shadow-sm pointer-events-none transform translate-y-1/2" style={{ top: `calc(${paddingTop} / 2)` }} />
            )}

            {/* Inner Content Block */}
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className={`
                    relative group border-2 rounded-xl px-4
                    ${isSelected
                        ? 'border-visualy-accent-4 ring-4 ring-visualy-accent-4/10 z-10'
                        : 'border-transparent hover:border-gray-200'
                    }
                    ${isDragging ? 'opacity-50' : 'opacity-100'}
                `}
            >
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className={`
                        absolute -top-9 left-0 p-2 bg-white text-gray-400 hover:text-visualy-accent-4 rounded-full shadow-sm border border-gray-200 transition-all cursor-move touch-none z-20 flex items-center justify-center
                        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}
                    title="Přesunout blok"
                >
                    <ArrowsUpDownIcon className="h-4 w-4" />
                </div>

                {/* Delete Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                    className={`
                        absolute -top-9 right-0 p-2 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full shadow-sm border border-gray-200 transition-all z-20 flex items-center justify-center
                        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    `}
                    title="Odstranit blok"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>

                {renderContent()}
            </div>
        </div>
    );
}
