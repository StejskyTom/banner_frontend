import { useState, useRef } from 'react';
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
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
    BookmarkIcon,
    ViewColumnsIcon,
    ImageIcon,
    VideoCameraIcon
} from '@heroicons/react/24/solid';
import ContentEditable from './ContentEditable';

const CHILD_BLOCK_TYPES = [
    { type: 'text', label: 'Text', icon: Bars3BottomLeftIcon },
    { type: 'image', label: 'Obrázek', icon: PhotoIcon },
    { type: 'table', label: 'Tabulka', icon: TableCellsIcon },
    { type: 'banner', label: 'Banner', icon: MegaphoneIcon },
    { type: 'product', label: 'Produkt', icon: ShoppingBagIcon },
    { type: 'products_grid', label: 'Produktový grid', icon: ShoppingBagIcon },
    { type: 'author', label: 'Autor', icon: UserCircleIcon },
    { type: 'video', label: 'Video', icon: VideoCameraIcon },
];

const SAVED_BLOCK_ICONS = {
    text: Bars3BottomLeftIcon,
    image: PhotoIcon,
    banner: MegaphoneIcon,
    product: ShoppingBagIcon,
    products_grid: ShoppingBagIcon,
    table: TableCellsIcon,
    wrap: PhotoIcon,
    author: UserCircleIcon,
    layout: ViewColumnsIcon,
};

function createChildBlock(type) {
    const newBlock = { id: crypto.randomUUID(), type, margin: 12 };
    if (type === 'text') { newBlock.content = 'Nový text'; newBlock.tag = 'p'; }
    if (type === 'image') { newBlock.url = ''; newBlock.width = 100; newBlock.align = 'center'; }
    if (type === 'video') { newBlock.url = ''; newBlock.width = 100; newBlock.ratio = '16/9'; newBlock.align = 'center'; newBlock.autoPlay = false; }
    if (type === 'banner') { newBlock.content = 'NADPIS'; newBlock.bgColor = '#f3f4f6'; newBlock.textColor = '#111827'; }
    if (type === 'product') { newBlock.name = 'Produkt'; newBlock.link = ''; newBlock.imgUrl = ''; newBlock.price = ''; newBlock.btnText = 'Koupit'; }
    if (type === 'table') { newBlock.header = ['Sloupec 1', 'Sloupec 2', 'Sloupec 3']; newBlock.data = [['', '', ''], ['', '', ''], ['', '', '']]; newBlock.rows = 3; newBlock.cols = 3; newBlock.width = 100; newBlock.borderStyle = 'full'; newBlock.borderColor = '#e5e7eb'; newBlock.headerBgColor = '#f3f4f6'; newBlock.headerTextColor = '#111827'; newBlock.stripedRows = false; newBlock.stripedColor = '#f9fafb'; newBlock.cellPadding = 12; newBlock.fontSize = 14; }
    if (type === 'author') { newBlock.authorName = ''; newBlock.authorTitle = ''; newBlock.authorBio = ''; newBlock.authorPhotoUrl = ''; }
    if (type === 'products_grid') {
        newBlock.selectedProducts = [];
        newBlock.layout = 'grid';
        newBlock.gridColumns = 3;
        newBlock.buttonText = 'Koupit';
        newBlock.buttonColor = '#26AD80';
        newBlock.buttonTextColor = '#ffffff';
        newBlock.buttonFontSize = '14px';
        newBlock.buttonBorderRadius = 8;
        newBlock.cardBackgroundColor = '#ffffff';
        newBlock.cardBorderRadius = 12;
        newBlock.cardBorderEnabled = true;
        newBlock.cardBorderColor = '#e5e7eb';
        newBlock.cardBorderWidth = 1;
        newBlock.cardShadowEnabled = false;
        newBlock.cardShadowColor = '#000000';
        newBlock.cardShadowBlur = 10;
        newBlock.cardShadowOpacity = 10;
        newBlock.cardPaddingX = 16;
        newBlock.cardPaddingY = 16;
        newBlock.productNameColor = '#111827';
        newBlock.productNameSize = '14px';
        newBlock.productNameBold = true;
        newBlock.priceColor = '#059669';
        newBlock.priceSize = '18px';
        newBlock.priceBold = true;
        newBlock.priceFormat = 'no_decimals';
        newBlock.imageHeight = 160;
        newBlock.imageObjectFit = 'contain';
        newBlock.imagePadding = 8;
        newBlock.imageMarginBottom = 12;
        newBlock.imageBorderRadius = 8;
        newBlock.descriptionEnabled = false;
        newBlock.descriptionColor = '#4b5563';
        newBlock.descriptionSize = '13px';
        newBlock.descriptionTruncateLength = 100;
    }
    return newBlock;
}

function resolveVideoUrl(url, autoPlay) {
    if (!url) return '';
    const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (m && m[1]) {
        return `https://www.youtube.com/embed/${m[1]}${autoPlay ? '?autoplay=1&mute=1' : ''}`;
    }
    return url;
}

function AddBlockMenu({ onAdd, isEmptyState = false, savedBlocks = [], onAddSaved }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`relative group/add ${isEmptyState ? 'h-full flex-1 min-h-[140px]' : 'pt-2'} ${open ? 'z-50' : 'z-10'}`}>
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
                        {savedBlocks && savedBlocks.length > 0 && (
                            <>
                                <div className="mx-3 my-1 h-px bg-gray-100" />
                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <BookmarkIcon className="h-3 w-3" />
                                    <span>Uložené šablony</span>
                                </div>
                                {savedBlocks.map((sb) => {
                                    const SbIcon = SAVED_BLOCK_ICONS[sb.blockType] || BookmarkIcon;
                                    return (
                                        <button
                                            key={sb.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddSaved?.(sb);
                                                setOpen(false);
                                            }}
                                            className="w-full px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-visualy-accent-4/10 hover:text-visualy-accent-4 rounded-xl flex items-center gap-3 transition-colors group"
                                        >
                                            <div className="p-2 rounded-lg bg-visualy-accent-4/10 text-visualy-accent-4 group-hover:bg-visualy-accent-4/20 transition-colors">
                                                <SbIcon className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-semibold leading-tight truncate">{sb.name}</span>
                                                <span className="text-[10px] text-gray-400 group-hover:text-visualy-accent-4/60 transition-colors">Uložená šablona</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </>
                        )}
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

function LayoutChildBlock({ childBlock, isSelected, onClick, onChange, onFormatChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, renderProduct, resolveImageUrl }) {
    const renderChildContent = () => {
        if (childBlock.type === 'text') {
            const getBorder = () => {
                const bStyle = childBlock.borderStyle || 'none';
                if (bStyle === 'none') return {};
                const borderStr = `${childBlock.borderWidth || 2}px solid ${childBlock.borderColor || '#000000'}`;
                if (bStyle === 'all') return { border: borderStr };
                if (bStyle === 'left') return { borderLeft: borderStr };
                if (bStyle === 'top') return { borderTop: borderStr };
                if (bStyle === 'bottom') return { borderBottom: borderStr };
                return {};
            };

            const contentNode = (
                <ContentEditable
                    tagName="div"
                    html={childBlock.content || ''}
                    onChange={(html) => onChange({ ...childBlock, content: html })}
                    onFormatChange={onFormatChange}
                    style={{ flex: 1, minWidth: 0, textAlign: childBlock.align || 'left', background: 'transparent', border: 'none', outline: 'none', lineHeight: 1.5, minHeight: '1.5em', fontSize: '14px' }}
                    className="focus:outline-none empty:before:content-[attr(placeholder)] empty:before:text-gray-400 [&>h1]:text-xl [&>h1]:font-bold [&>h2]:text-lg [&>h2]:font-bold [&>h3]:text-base [&>h3]:font-bold [&>p]:mb-1"
                    placeholder="Klikněte a pište..."
                />
            );

            return (
                <div style={{
                    width: '100%',
                    background: childBlock.bgColor === 'transparent' ? 'transparent' : (childBlock.bgColor || 'transparent'),
                    padding: `${childBlock.paddingY || 0}px ${childBlock.paddingX || 0}px`,
                    borderRadius: `${childBlock.borderRadius || 0}px`,
                    ...getBorder(),
                    display: childBlock.iconUrl ? 'flex' : 'block',
                    flexDirection: childBlock.iconUrl ? (childBlock.iconPosition || 'flex-row') : 'column',
                    alignItems: childBlock.iconUrl ? (childBlock.iconAlignItems || 'flex-start') : 'stretch',
                    gap: childBlock.iconUrl ? '16px' : '0'
                }}>
                    {childBlock.iconUrl && (
                        <div style={{ flexShrink: 0 }}>
                            <img src={resolveImageUrl(childBlock.iconUrl)} style={{ width: `${childBlock.iconSize || 24}px`, height: 'auto', display: 'block' }} alt="" />
                        </div>
                    )}
                    {contentNode}
                </div>
            );
        }
        if (childBlock.type === 'image') {
            return (
                <div style={{ textAlign: childBlock.align || 'center' }}>
                    {childBlock.url ? (
                        <img src={resolveImageUrl(childBlock.url)} style={{ width: `${childBlock.width}%`, maxWidth: '100%', borderRadius: childBlock.rounded === false ? '0' : '6px', display: 'inline-block' }} alt="" />
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400 text-xs">
                            <PhotoIcon className="h-6 w-6 mx-auto mb-1 text-gray-300" />
                            Vyberte obrázek
                        </div>
                    )}
                </div>
            );
        }
        if (childBlock.type === 'video') {
            const paddingBottom = childBlock.ratio === '4/3' ? '75%' : childBlock.ratio === '1/1' ? '100%' : '56.25%';
            return (
                <div style={{ textAlign: childBlock.align || 'center', width: '100%' }}>
                    <div style={{ width: `${childBlock.width || 100}%`, display: 'inline-block', position: 'relative', overflow: 'hidden', paddingBottom, height: 0, borderRadius: '8px' }}>
                        {childBlock.url ? (
                            <iframe
                                src={resolveVideoUrl(childBlock.url, childBlock.autoPlay)}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-gray-100/50 border border-dashed border-gray-200 text-gray-400 text-xs flex-col">
                                <VideoCameraIcon className="h-6 w-6 mb-1 text-gray-300" />
                                Vložte URL videa
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        if (childBlock.type === 'banner') {
            const bgOverlay = childBlock.bgOverlay !== undefined ? childBlock.bgOverlay : 50;
            return (
                <div style={{
                    background: childBlock.bgImageUrl ? `url(${resolveImageUrl(childBlock.bgImageUrl)}) center/cover no-repeat` : (childBlock.bgColor || '#f3f4f6'),
                    padding: `${childBlock.paddingY || 16}px 16px`,
                    borderRadius: '8px',
                    textAlign: childBlock.align || 'center',
                    borderLeft: childBlock.bgImageUrl ? 'none' : '3px solid #26AD80',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {childBlock.bgImageUrl && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${bgOverlay / 100})`, zIndex: 1 }}></div>
                    )}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <input
                            value={childBlock.content || ''}
                            onChange={(e) => onChange({ ...childBlock, content: e.target.value })}
                            style={{ color: childBlock.textColor || (childBlock.bgImageUrl ? '#ffffff' : '#111827'), textTransform: 'uppercase', fontSize: '14px', fontWeight: 700, background: 'transparent', border: 'none', textAlign: childBlock.align || 'center', width: '100%', outline: 'none' }}
                            placeholder="NADPIS"
                        />
                        {childBlock.subtitle && (
                            <input
                                value={childBlock.subtitle || ''}
                                onChange={(e) => onChange({ ...childBlock, subtitle: e.target.value })}
                                style={{ color: childBlock.textColor || (childBlock.bgImageUrl ? '#f3f4f6' : '#4b5563'), fontSize: '12px', background: 'transparent', border: 'none', textAlign: childBlock.align || 'center', width: '100%', outline: 'none', marginTop: '4px' }}
                                placeholder="Podnadpis"
                            />
                        )}
                        {childBlock.btnText && (
                            <button
                                style={{ background: childBlock.btnColor || '#4f46e5', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, marginTop: '12px', border: 'none', cursor: 'pointer' }}
                                onClick={(e) => e.preventDefault()}
                            >
                                {childBlock.btnText}
                            </button>
                        )}
                    </div>
                </div>
            );
        }
        if (childBlock.type === 'product') {
            return renderProduct(childBlock, true);
        }
        if (childBlock.type === 'author') {
            return (
                <div style={{
                    backgroundColor: childBlock.backgroundColor || '#ffffff',
                    borderRadius: `${childBlock.borderRadius || 0}px`,
                    border: childBlock.borderEnabled ? `${childBlock.borderWidth || 1}px solid ${childBlock.borderColor || '#e5e7eb'}` : '1px solid #e5e7eb',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: childBlock.layout === 'side-by-side' ? 'row' : 'column',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: childBlock.layout === 'side-by-side' ? 'left' : 'center',
                    width: '100%'
                }}>
                    {childBlock.photoUrl && (
                        <img
                            src={resolveImageUrl(childBlock.photoUrl)}
                            alt={childBlock.name}
                            style={{
                                width: '64px',
                                height: '64px',
                                objectFit: 'cover',
                                borderRadius: `${childBlock.photoRadius !== undefined ? childBlock.photoRadius : 50}%`,
                                boxShadow: childBlock.photoShadow ? `0 ${childBlock.photoShadowBlur ? childBlock.photoShadowBlur / 4 : 4}px ${childBlock.photoShadowBlur || 12}px ${hexToRgba('#000000', (childBlock.photoShadowOpacity || 25) / 100)}` : 'none',
                                marginBottom: childBlock.layout !== 'side-by-side' ? `${childBlock.photoMarginBottom || 12}px` : '0',
                                flexShrink: 0
                            }}
                        />
                    )}
                    <div style={{ flex: 1, width: '100%' }}>
                        {(childBlock.name || !childBlock.photoUrl) && (
                            <div
                                style={{
                                    color: childBlock.authorNameColor || '#111827',
                                    fontSize: childBlock.authorNameSize ? `calc(${childBlock.authorNameSize} * 0.9)` : '18px',
                                    fontFamily: childBlock.authorNameFont || 'inherit',
                                    fontWeight: childBlock.authorNameBold !== false ? 'bold' : 'normal',
                                    fontStyle: childBlock.authorNameItalic ? 'italic' : 'normal',
                                    textAlign: childBlock.layout === 'side-by-side' ? 'left' : (childBlock.authorNameAlign || 'center'),
                                    marginBottom: `${childBlock.authorNameMarginBottom !== undefined ? childBlock.authorNameMarginBottom : 4}px`
                                }}
                            >
                                {childBlock.name || 'Jméno autora'}
                            </div>
                        )}
                        {childBlock.title && (
                            <div
                                style={{
                                    color: childBlock.authorTitleColor || '#26AD80',
                                    fontSize: childBlock.authorTitleSize ? `calc(${childBlock.authorTitleSize} * 0.9)` : '12px',
                                    fontFamily: childBlock.authorTitleFont || 'inherit',
                                    fontWeight: childBlock.authorTitleBold !== false ? 'bold' : 'normal',
                                    fontStyle: childBlock.authorTitleItalic ? 'italic' : 'normal',
                                    textAlign: childBlock.layout === 'side-by-side' ? 'left' : (childBlock.authorTitleAlign || 'center'),
                                    marginBottom: `${childBlock.authorTitleMarginBottom !== undefined ? childBlock.authorTitleMarginBottom : 8}px`
                                }}
                            >
                                {childBlock.title}
                            </div>
                        )}
                        {childBlock.bio && (
                            <div
                                style={{
                                    color: childBlock.authorBioColor || '#4b5563',
                                    fontSize: childBlock.authorBioSize ? `calc(${childBlock.authorBioSize} * 0.9)` : '12px',
                                    fontFamily: childBlock.authorBioFont || 'inherit',
                                    fontWeight: childBlock.authorBioBold ? 'bold' : 'normal',
                                    fontStyle: childBlock.authorBioItalic ? 'italic' : 'normal',
                                    textAlign: childBlock.layout === 'side-by-side' ? 'left' : (childBlock.authorBioAlign || 'center'),
                                    marginBottom: `${childBlock.authorBioMarginBottom !== undefined ? childBlock.authorBioMarginBottom : 0}px`
                                }}
                            >
                                {childBlock.bio}
                            </div>
                        )}
                    </div>
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

export default function PreviewBlock({ block, isSelected, selectedBlockId, onClick, onSelectBlock, onChange, onFormatChange, onDelete, savedBlocks = [] }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver
    } = useSortable({ id: block.id });
    const scrollContainerRef = useRef(null);

    const { active } = useDndContext();
    const isPaletteItem = active?.data?.current?.isPaletteItem;
    const showDropIndicator = isPaletteItem && isOver;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        marginBottom: `${block.margin || 24}px`,
        position: 'relative'
    };

    const hexToRgba = (hex, alpha) => {
        if (!hex) return `rgba(0, 0, 0, ${alpha})`;
        if (!hex.startsWith('#')) return hex;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const resolveImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    };

    const renderProduct = (productBlock, isNested = false) => {
        const cardStyle = {
            background: productBlock.cardBackgroundColor || '#ffffff',
            border: productBlock.cardBorderEnabled ? `${productBlock.cardBorderWidth || 1}px solid ${productBlock.cardBorderColor || '#e5e7eb'}` : '1px solid #e5e7eb',
            padding: `${productBlock.cardPaddingY !== undefined ? productBlock.cardPaddingY : (isNested ? 16 : 20)}px ${productBlock.cardPaddingX !== undefined ? productBlock.cardPaddingX : (isNested ? 16 : 20)}px`,
            borderRadius: productBlock.cardBorderRadius !== undefined ? `${productBlock.cardBorderRadius}px` : (isNested ? '8px' : '12px'),
            textAlign: 'center',
            boxShadow: productBlock.cardShadowEnabled
                ? `0 ${productBlock.cardShadowBlur ? productBlock.cardShadowBlur / 4 : 4}px ${productBlock.cardShadowBlur || 10}px ${productBlock.cardShadowColor ? hexToRgba(productBlock.cardShadowColor, (productBlock.cardShadowOpacity || 10) / 100) : 'rgba(0,0,0,0.1)'}`
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: isNested ? 'none' : '400px',
            margin: isNested ? '0' : `0 auto ${productBlock.margin !== undefined ? productBlock.margin : 24}px`,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
        };

        const imageStyle = {
            width: '100%',
            height: `${productBlock.imageHeight || (isNested ? 120 : 160)}px`,
            objectFit: productBlock.imageObjectFit || 'contain',
            borderRadius: `${productBlock.imageBorderRadius !== undefined ? productBlock.imageBorderRadius : 8}px`,
            padding: `${productBlock.imagePadding !== undefined ? productBlock.imagePadding : 8}px`,
            marginBottom: `${productBlock.imageMarginBottom !== undefined ? productBlock.imageMarginBottom : 16}px`,
            display: 'block',
            margin: `0 auto ${productBlock.imageMarginBottom || 16}px auto`
        };

        const nameStyle = {
            color: productBlock.productNameColor || '#111827',
            fontSize: productBlock.productNameSize || (isNested ? '14px' : '16px'),
            fontFamily: productBlock.productNameFont || 'inherit',
            fontWeight: productBlock.productNameBold ? 'bold' : '600',
            fontStyle: productBlock.productNameItalic ? 'italic' : 'normal',
            textAlign: productBlock.productNameAlign || 'center',
            marginTop: `${productBlock.productNameMarginTop || 0}px`,
            marginBottom: `${productBlock.productNameMarginBottom !== undefined ? productBlock.productNameMarginBottom : (isNested ? 4 : 12)}px`,
            display: productBlock.productNameFull ? 'block' : '-webkit-box',
            WebkitLineClamp: productBlock.productNameFull ? 'none' : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        };

        const descriptionStyle = {
            color: productBlock.descriptionColor || '#4b5563',
            fontSize: productBlock.descriptionSize || '14px',
            fontFamily: productBlock.descriptionFont || 'inherit',
            fontWeight: productBlock.descriptionBold ? 'bold' : 'normal',
            fontStyle: productBlock.descriptionItalic ? 'italic' : 'normal',
            textAlign: productBlock.descriptionAlign || 'center',
            lineHeight: '1.4',
            marginTop: `${productBlock.descriptionMarginTop || 0}px`,
            marginBottom: `${productBlock.descriptionMarginBottom || 16}px`,
            display: '-webkit-box',
            WebkitLineClamp: productBlock.descriptionTruncateLength ? Math.ceil(productBlock.descriptionTruncateLength / 50) : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
        };

        const priceStyle = {
            color: productBlock.priceColor || '#059669',
            fontSize: productBlock.priceSize || (isNested ? '14px' : '20px'),
            fontFamily: productBlock.priceFont || 'inherit',
            fontWeight: productBlock.priceBold !== false ? 'bold' : 'normal',
            fontStyle: productBlock.priceItalic ? 'italic' : 'normal',
            textAlign: productBlock.priceAlign || 'center',
            marginTop: `${productBlock.priceMarginTop || (isNested ? 4 : 0)}px`,
            marginBottom: `${productBlock.priceMarginBottom !== undefined ? productBlock.priceMarginBottom : 16}px`
        };

        const btnStyle = {
            background: productBlock.btnColor || '#26AD80',
            color: productBlock.btnTextColor || 'white',
            fontSize: productBlock.btnFontSize || (isNested ? '12px' : '14px'),
            fontFamily: productBlock.btnFont || 'inherit',
            fontWeight: productBlock.btnBold ? 'bold' : '500',
            fontStyle: productBlock.btnItalic ? 'italic' : 'normal',
            padding: isNested ? '6px 16px' : '10px 24px',
            borderRadius: productBlock.btnBorderRadius !== undefined ? `${productBlock.btnBorderRadius}px` : (isNested ? '4px' : '8px'),
            display: 'inline-block',
            marginTop: `${productBlock.buttonMarginTop || 8}px`,
            marginBottom: `${productBlock.buttonMarginBottom || 0}px`,
            textDecoration: 'none'
        };

        const TitleTag = productBlock.productNameTag || 'h3';

        const handleNameChange = (val) => {
            // Strip HTML tags when editing name and description
            const cleanVal = val.replace(/<[^>]*>?/gm, '');
            if (productBlock.productId && block.type === 'products_grid') {
                const newProducts = block.selectedProducts.map(p =>
                    p.id === productBlock.productId ? { ...p, productName: cleanVal } : p
                );
                onChange({ ...block, selectedProducts: newProducts });
            } else {
                onChange({ ...block, name: cleanVal });
            }
        };

        const handleDescChange = (val) => {
            const cleanVal = val.replace(/<[^>]*>?/gm, '');
            if (productBlock.productId && block.type === 'products_grid') {
                const newProducts = block.selectedProducts.map(p =>
                    p.id === productBlock.productId ? { ...p, description: cleanVal } : p
                );
                onChange({ ...block, selectedProducts: newProducts });
            } else {
                onChange({ ...block, description: cleanVal });
            }
        };

        return (
            <div style={cardStyle}>
                {productBlock.imgUrl && (
                    <div style={{ padding: `${productBlock.imagePadding || 0}px` }}>
                        <img
                            src={resolveImageUrl(productBlock.imgUrl)}
                            alt={productBlock.name || ''}
                            style={imageStyle}
                        />
                    </div>
                )}

                <ContentEditable
                    tagName={productBlock.productNameTag || 'h3'}
                    html={productBlock.name || 'Produkt'}
                    onChange={handleNameChange}
                    style={{ ...nameStyle, outline: 'none' }}
                />

                {productBlock.descriptionEnabled !== false && (
                    <ContentEditable
                        tagName="div"
                        html={productBlock.description || 'Popis produktu...'}
                        onChange={handleDescChange}
                        style={{ ...descriptionStyle, outline: 'none' }}
                    />
                )}

                {productBlock.price && (
                    <div style={priceStyle}>{productBlock.price}</div>
                )}

                <a href={productBlock.link || '#'} style={btnStyle} onClick={(e) => e.preventDefault()}>
                    {productBlock.btnText || 'Koupit'}
                </a>
            </div>
        );
    };

    const renderContent = () => {
        const margin = { marginBottom: 0 };

        if (block.type === 'text') {
            const getBorder = () => {
                const bStyle = block.borderStyle || 'none';
                if (bStyle === 'none') return {};
                const borderStr = `${block.borderWidth || 2}px solid ${block.borderColor || '#000000'}`;
                if (bStyle === 'all') return { border: borderStr };
                if (bStyle === 'left') return { borderLeft: borderStr };
                if (bStyle === 'top') return { borderTop: borderStr };
                if (bStyle === 'bottom') return { borderBottom: borderStr };
                return {};
            };

            const contentNode = (
                <ContentEditable
                    tagName="div"
                    html={block.content || ''}
                    onChange={(html) => onChange({ ...block, content: html })}
                    onFormatChange={onFormatChange}
                    style={{ flex: 1, minWidth: 0, textAlign: block.align || 'left', ...margin, background: 'transparent', border: 'none', outline: 'none', lineHeight: 1.5, minHeight: '1.5em', fontSize: '16px' }}
                    className="focus:outline-none empty:before:content-[attr(placeholder)] empty:before:text-gray-400 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&>p]:mb-2"
                    placeholder="Klikněte a pište..."
                />
            );

            return (
                <div style={{
                    ...margin,
                    width: '100%',
                    background: block.bgColor === 'transparent' ? 'transparent' : (block.bgColor || 'transparent'),
                    padding: `${block.paddingY || 0}px ${block.paddingX || 0}px`,
                    borderRadius: `${block.borderRadius || 0}px`,
                    ...getBorder(),
                    display: block.iconUrl ? 'flex' : 'block',
                    flexDirection: block.iconUrl ? (block.iconPosition || 'flex-row') : 'column',
                    alignItems: block.iconUrl ? (block.iconAlignItems || 'flex-start') : 'stretch',
                    gap: block.iconUrl ? '16px' : '0'
                }}>
                    {block.iconUrl && (
                        <div style={{ flexShrink: 0 }}>
                            <img src={resolveImageUrl(block.iconUrl)} style={{ width: `${block.iconSize || 24}px`, height: 'auto', display: 'block' }} alt="" />
                        </div>
                    )}
                    {contentNode}
                </div>
            );
        }
        if (block.type === 'image') {
            return (
                <div style={{ textAlign: block.align || 'center', marginBottom: `${block.margin !== undefined ? block.margin : 24}px` }}>
                    {block.url ? (
                        <img src={resolveImageUrl(block.url)} style={{ width: `${block.width}%`, maxWidth: '100%', borderRadius: block.rounded === false ? '0' : '8px', display: 'inline-block' }} alt="" />
                    ) : (
                        <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-400">Vyberte obrázek v nastavení</div>
                    )}
                </div>
            );
        }
        if (block.type === 'video') {
            const paddingBottom = block.ratio === '4/3' ? '75%' : block.ratio === '1/1' ? '100%' : '56.25%';
            return (
                <div style={{ textAlign: block.align || 'center', width: '100%', ...margin }}>
                    <div style={{ width: `${block.width || 100}%`, display: 'inline-block', position: 'relative', overflow: 'hidden', paddingBottom, height: 0, borderRadius: '12px' }}>
                        {block.url ? (
                            <iframe
                                src={resolveVideoUrl(block.url, block.autoPlay)}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 flex-col">
                                <VideoCameraIcon className="h-10 w-10 mb-2 text-gray-300" />
                                Vložte URL videa v nastavení panelu
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        if (block.type === 'author') {
            return (
                <div style={{
                    backgroundColor: block.backgroundColor || '#ffffff',
                    borderRadius: `${block.borderRadius || 0}px`,
                    border: block.borderEnabled ? `${block.borderWidth || 1}px solid ${block.borderColor || '#e5e7eb'}` : 'none',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: block.layout === 'side-by-side' ? 'row' : 'column',
                    alignItems: 'center',
                    gap: '16px',
                    textAlign: block.layout === 'side-by-side' ? 'left' : 'center',
                    ...margin
                }}>
                    {block.photoUrl && (
                        <img
                            src={resolveImageUrl(block.photoUrl)}
                            alt={block.name}
                            style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: `${block.photoRadius !== undefined ? block.photoRadius : 50}%`,
                                boxShadow: block.photoShadow ? `0 ${block.photoShadowBlur ? block.photoShadowBlur / 4 : 4}px ${block.photoShadowBlur || 12}px ${hexToRgba('#000000', (block.photoShadowOpacity || 25) / 100)}` : 'none',
                                marginBottom: block.layout !== 'side-by-side' ? `${block.photoMarginBottom || 16}px` : '0',
                                flexShrink: 0
                            }}
                        />
                    )}
                    <div style={{ flex: 1 }}>
                        {(block.name || !block.photoUrl) && (
                            <div
                                style={{
                                    color: block.authorNameColor || '#111827',
                                    fontSize: block.authorNameSize || '20px',
                                    fontFamily: block.authorNameFont || 'inherit',
                                    fontWeight: block.authorNameBold !== false ? 'bold' : 'normal',
                                    fontStyle: block.authorNameItalic ? 'italic' : 'normal',
                                    textAlign: block.layout === 'side-by-side' ? 'left' : (block.authorNameAlign || 'center'),
                                    marginBottom: `${block.authorNameMarginBottom !== undefined ? block.authorNameMarginBottom : 4}px`
                                }}
                            >
                                {block.name || 'Jméno autora'}
                            </div>
                        )}
                        {block.title && (
                            <div
                                style={{
                                    color: block.authorTitleColor || '#26AD80',
                                    fontSize: block.authorTitleSize || '14px',
                                    fontFamily: block.authorTitleFont || 'inherit',
                                    fontWeight: block.authorTitleBold !== false ? 'bold' : 'normal',
                                    fontStyle: block.authorTitleItalic ? 'italic' : 'normal',
                                    textAlign: block.layout === 'side-by-side' ? 'left' : (block.authorTitleAlign || 'center'),
                                    marginBottom: `${block.authorTitleMarginBottom !== undefined ? block.authorTitleMarginBottom : 12}px`
                                }}
                            >
                                {block.title}
                            </div>
                        )}
                        {block.bio && (
                            <div
                                style={{
                                    color: block.authorBioColor || '#4b5563',
                                    fontSize: block.authorBioSize || '14px',
                                    fontFamily: block.authorBioFont || 'inherit',
                                    fontWeight: block.authorBioBold ? 'bold' : 'normal',
                                    fontStyle: block.authorBioItalic ? 'italic' : 'normal',
                                    textAlign: block.layout === 'side-by-side' ? 'left' : (block.authorBioAlign || 'center'),
                                    marginBottom: `${block.authorBioMarginBottom !== undefined ? block.authorBioMarginBottom : 0}px`
                                }}
                            >
                                {block.bio}
                            </div>
                        )}
                    </div>
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
                        style={{ background: 'transparent', border: 'none', outline: 'none', lineHeight: 1.6, minHeight: '1.5em', fontSize: '16px' }}
                        className="focus:outline-none empty:before:content-[attr(placeholder)] empty:before:text-gray-400 [&>h1]:text-2xl [&>h1]:font-bold [&>h2]:text-xl [&>h2]:font-bold [&>h3]:text-lg [&>h3]:font-bold [&>p]:mb-2"
                        placeholder="Klikněte a pište..."
                    />
                    <div style={{ clear: 'both' }}></div>
                </div>
            );
        }
        if (block.type === 'banner') {
            const bgOverlay = block.bgOverlay !== undefined ? block.bgOverlay : 50;
            return (
                <div style={{
                    background: block.bgImageUrl ? `url(${resolveImageUrl(block.bgImageUrl)}) center/cover no-repeat` : (block.bgColor || '#f3f4f6'),
                    padding: `${block.paddingY || 24}px 24px`,
                    borderRadius: '12px',
                    textAlign: block.align || 'center',
                    borderLeft: block.bgImageUrl ? 'none' : '4px solid #26AD80',
                    ...margin,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {block.bgImageUrl && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0,0,0,${bgOverlay / 100})`, zIndex: 1 }}></div>
                    )}
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <input
                            value={block.content || ''}
                            onChange={(e) => onChange({ ...block, content: e.target.value })}
                            style={{ color: block.textColor || (block.bgImageUrl ? '#ffffff' : '#111827'), textTransform: 'uppercase', fontSize: '18px', fontWeight: 700, background: 'transparent', border: 'none', textAlign: block.align || 'center', width: '100%', outline: 'none' }}
                            placeholder="NADPIS SEKCE"
                        />
                        {block.subtitle && (
                            <input
                                value={block.subtitle || ''}
                                onChange={(e) => onChange({ ...block, subtitle: e.target.value })}
                                style={{ color: block.textColor || (block.bgImageUrl ? '#f3f4f6' : '#4b5563'), fontSize: '14px', background: 'transparent', border: 'none', textAlign: block.align || 'center', width: '100%', outline: 'none', marginTop: '8px' }}
                                placeholder="Podnadpis"
                            />
                        )}
                        {block.btnText && (
                            <button
                                style={{ background: block.btnColor || '#4f46e5', color: '#ffffff', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, marginTop: '16px', border: 'none', cursor: 'pointer' }}
                                onClick={(e) => e.preventDefault()}
                            >
                                {block.btnText}
                            </button>
                        )}
                    </div>
                </div>
            );
        }
        if (block.type === 'product') {
            return renderProduct(block, false);
        }
        if (block.type === 'products_grid') {
            const products = block.selectedProducts || [];
            if (products.length === 0) {
                return (
                    <div style={{ ...margin, textAlign: 'center', padding: '32px', border: '2px dashed #e5e7eb', borderRadius: '12px', color: '#9ca3af', background: '#f9fafb' }}>
                        <ShoppingBagIcon style={{ width: 40, height: 40, margin: '0 auto 8px', display: 'block' }} />
                        Zatím nebyly vybrány žádné produkty (upravte v nastavení bloku)
                    </div>
                );
            }

            const isCarousel = block.layout === 'carousel';
            const gridCols = block.gridColumns || 3;

            const renderItem = (p) => {
                const mergedBlock = {
                    ...block,
                    productId: p.id,
                    name: p.productName,
                    price: p.priceVat ? `${p.priceVat} Kč` : '',
                    imgUrl: p.imgUrl,
                    description: p.description,
                    link: p.url,
                    btnText: block.buttonText || 'Koupit'
                };
                return (
                    <div
                        key={p.id}
                        style={isCarousel ? {
                            minWidth: `calc((100% - (${gridCols} - 1) * 24px) / ${gridCols})`,
                            maxWidth: `calc((100% - (${gridCols} - 1) * 24px) / ${gridCols})`,
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'column'
                        } : {
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {renderProduct(mergedBlock, true)}
                    </div>
                );
            };

            const scrollLeft = () => {
                if (scrollContainerRef.current) {
                    const item = scrollContainerRef.current.firstElementChild;
                    const scrollAmount = item ? (item.clientWidth + 24) : 300;
                    scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                }
            };

            const scrollRight = () => {
                if (scrollContainerRef.current) {
                    const item = scrollContainerRef.current.firstElementChild;
                    const scrollAmount = item ? (item.clientWidth + 24) : 300;
                    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            };

            return (
                <div style={{ ...margin, position: 'relative' }} className="group">
                    {isCarousel && block.carouselArrows !== false && (
                        <>
                            <button
                                onClick={scrollLeft}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 shadow-lg p-2 hover:brightness-95 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                aria-label="Scroll left"
                                style={{
                                    backgroundColor: block.carouselArrowsBackground || '#ffffff',
                                    color: block.carouselArrowsColor || '#374151',
                                    borderRadius: `${block.carouselArrowsBorderRadius !== undefined ? block.carouselArrowsBorderRadius : 50}%`,
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={scrollRight}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 shadow-lg p-2 hover:brightness-95 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                aria-label="Scroll right"
                                style={{
                                    backgroundColor: block.carouselArrowsBackground || '#ffffff',
                                    color: block.carouselArrowsColor || '#374151',
                                    borderRadius: `${block.carouselArrowsBorderRadius !== undefined ? block.carouselArrowsBorderRadius : 50}%`,
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}
                    <div ref={isCarousel ? scrollContainerRef : null} style={isCarousel ? { display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '16px', snapType: 'x mandatory', alignItems: 'stretch', scrollbarWidth: 'none', msOverflowStyle: 'none' } : { display: 'grid', gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gap: '24px', alignItems: 'stretch' }} className={isCarousel ? "[&::-webkit-scrollbar]:hidden" : ""}>
                        {products.map(renderItem)}
                    </div>
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
            const borderColor = block.borderColor || '#e5e7eb';
            const borderStyle = block.borderStyle || 'full';
            const cellPad = block.cellPadding !== undefined ? block.cellPadding : 12;
            const fontSize = block.fontSize !== undefined ? block.fontSize : 14;
            const stripedRows = block.stripedRows || false;
            const stripedColor = block.stripedColor || '#f9fafb';

            const addCol = () => {
                const newHeader = [...(block.header || []), `Sloupec ${(block.header || []).length + 1}`];
                const newData = (block.data || []).map(row => [...row, '']);
                onChange({ ...block, header: newHeader, data: newData, cols: newHeader.length });
            };
            const removeCol = () => {
                if ((block.header || []).length <= 1) return;
                const newHeader = block.header.slice(0, -1);
                const newData = (block.data || []).map(row => row.slice(0, -1));
                onChange({ ...block, header: newHeader, data: newData, cols: newHeader.length });
            };
            const addRow = () => {
                const cols = (block.header || []).length;
                const newData = [...(block.data || []), new Array(cols).fill('')];
                onChange({ ...block, data: newData, rows: newData.length });
            };
            const removeRow = () => {
                if ((block.data || []).length <= 1) return;
                const newData = block.data.slice(0, -1);
                onChange({ ...block, data: newData, rows: newData.length });
            };

            const renderCellContent = (content) => {
                if (!block.comparisonMode) return content;
                const t = (content || '').trim().toLowerCase();
                if (t === '[v]') return <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 700 }}>✓</span>;
                if (t === '[x]') return <span style={{ color: '#ef4444', fontSize: 18, fontWeight: 700 }}>✗</span>;
                return content;
            };

            return (
                <div style={{ ...margin }}>
                    <div style={{ overflowX: 'auto', borderRadius: `${block.borderRadius !== undefined ? block.borderRadius : 8}px`, border: block.outerBorder !== false ? `1px solid ${borderColor}` : 'none', overflow: 'hidden' }}>
                        <table style={{
                            width: `${block.width || 100}%`,
                            borderCollapse: 'separate',
                            borderSpacing: 0,
                            fontSize: `${fontSize}px`,
                        }}>
                            <thead>
                                <tr>
                                    {(block.header || []).map((head, i) => (
                                        <th key={i} style={{
                                            background: block.headerBgColor || '#f3f4f6',
                                            color: block.headerTextColor || '#111827',
                                            padding: `${cellPad}px ${cellPad + 4}px`,
                                            textAlign: block.textAlign || 'left',
                                            fontWeight: 600,
                                            borderBottom: borderStyle !== 'none' ? `1px solid ${borderColor}` : 'none',
                                            borderRight: borderStyle === 'full' && i < (block.header.length - 1) ? `1px solid ${borderColor}` : 'none',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            <ContentEditable
                                                tagName="div"
                                                html={head}
                                                onChange={(val) => {
                                                    const newHeader = [...block.header];
                                                    newHeader[i] = val;
                                                    onChange({ ...block, header: newHeader });
                                                }}
                                                style={{ outline: 'none', minWidth: '60px', cursor: 'text' }}
                                            />
                                        </th>
                                    ))}
                                    {/* Add/remove column controls */}
                                    <th style={{ background: block.headerBgColor || '#f3f4f6', borderBottom: borderStyle !== 'none' ? `1px solid ${borderColor}` : 'none', padding: '4px', width: '56px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                                            <button onClick={removeCol} title="Odebrat sloupec" style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#6b7280', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                            <button onClick={addCol} title="Přidat sloupec" style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#22c55e', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(block.data || []).map((row, rowIndex) => (
                                    <tr key={rowIndex} style={{ background: stripedRows && rowIndex % 2 === 1 ? stripedColor : 'transparent' }}>
                                        {row.map((cell, colIndex) => (
                                            <td key={colIndex} style={{
                                                padding: `${cellPad}px ${cellPad + 4}px`,
                                                textAlign: block.textAlign || 'left',
                                                borderBottom: borderStyle !== 'none' && rowIndex < (block.data.length - 1) ? `1px solid ${borderColor}` : 'none',
                                                borderRight: borderStyle === 'full' && colIndex < (row.length - 1) ? `1px solid ${borderColor}` : 'none',
                                            }}>
                                                <ContentEditable
                                                    tagName="div"
                                                    html={cell}
                                                    onChange={(val) => {
                                                        const newData = [...block.data];
                                                        newData[rowIndex] = [...newData[rowIndex]];
                                                        newData[rowIndex][colIndex] = val;
                                                        onChange({ ...block, data: newData });
                                                    }}
                                                    style={{ outline: 'none', minWidth: '60px', cursor: 'text' }}
                                                />
                                                {block.comparisonMode && (
                                                    <div style={{ marginTop: 2, fontSize: 11, color: '#9ca3af' }}>
                                                        {renderCellContent(cell)}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                        {/* Row control placeholder */}
                                        <td style={{ padding: '2px 4px', borderBottom: borderStyle !== 'none' && rowIndex < (block.data.length - 1) ? `1px solid ${borderColor}` : 'none', textAlign: 'center', width: '56px' }}>
                                            {rowIndex === (block.data.length - 1) && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                                                    <button onClick={removeRow} title="Odebrat řádek" style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#6b7280', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                                    <button onClick={addRow} title="Přidat řádek" style={{ width: 22, height: 22, borderRadius: 4, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#22c55e', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>
                            {(block.header || []).length} sloupců × {(block.data || []).length} řádků
                            {block.comparisonMode && ' · Porovnávací režim'}
                        </span>
                    </div>
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
            const handleAddSavedChildBlock = (colIndex, savedBlock) => {
                const { id, savedBlockId, ...blockData } = savedBlock.blockData;
                const newChild = { ...blockData, type: savedBlock.blockType, id: crypto.randomUUID(), margin: 12, savedBlockId: savedBlock.id };
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
                        <div key={col.id} style={{ width: `${col.width}%`, minHeight: '120px' }} className="group/col relative flex flex-col border border-dashed border-gray-200 rounded-xl p-3 hover:bg-gray-50/50 hover:border-visualy-accent-4/40 hover:z-20 transition-all duration-200">
                            <div className="absolute -top-3 left-3 opacity-0 group-hover/col:opacity-100 transition-opacity z-10">
                                <span className="bg-white border border-gray-200 text-[10px] text-gray-500 font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                                    {Math.round(col.width)}%
                                </span>
                            </div>
                            <div className="flex-1 flex flex-col h-full">
                                {(col.blocks || []).length === 0 ? (
                                    <AddBlockMenu onAdd={(type) => handleAddChildBlock(colIndex, type)} isEmptyState={true} savedBlocks={savedBlocks} onAddSaved={(sb) => handleAddSavedChildBlock(colIndex, sb)} />
                                ) : (
                                    <>
                                        {(col.blocks || []).map((childBlock, blockIndex) => (
                                            <LayoutChildBlock
                                                key={childBlock.id}
                                                childBlock={childBlock}
                                                isSelected={selectedBlockId === childBlock.id}
                                                onClick={() => onSelectBlock(childBlock.id)}
                                                onChange={handleUpdateChildBlock}
                                                onFormatChange={onFormatChange}
                                                onDelete={() => handleDeleteChildBlock(childBlock.id)}
                                                onMoveUp={() => handleMoveChildBlock(colIndex, blockIndex, -1)}
                                                onMoveDown={() => handleMoveChildBlock(colIndex, blockIndex, 1)}
                                                isFirst={blockIndex === 0}
                                                isLast={blockIndex === col.blocks.length - 1}
                                                renderProduct={renderProduct}
                                                resolveImageUrl={resolveImageUrl}
                                            />
                                        ))}
                                        <AddBlockMenu onAdd={(type) => handleAddChildBlock(colIndex, type)} savedBlocks={savedBlocks} onAddSaved={(sb) => handleAddSavedChildBlock(colIndex, sb)} />
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

    return (
        <div ref={setNodeRef} style={style} onClick={onClick} className={`relative group p-4 rounded-2xl transition-all duration-200 ${isSelected ? 'ring-2 ring-visualy-accent-4 bg-visualy-accent-4/[0.03] shadow-lg shadow-visualy-accent-4/5 z-40' : 'hover:bg-gray-50/80 hover:ring-1 hover:ring-gray-200 hover:z-30'} ${isDragging ? 'z-50' : 'z-10'} ${showDropIndicator ? 'ring-2 ring-visualy-accent-4 ring-dashed bg-visualy-accent-4/10' : ''}`}>
            {/* Simple handle indicator on hover */}
            <div {...attributes} {...listeners} className="absolute -left-3 md:-left-6 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-2 text-gray-400 hover:text-visualy-accent-4 hover:bg-visualy-accent-4/10 rounded-lg z-50 shadow-sm border border-transparent hover:border-visualy-accent-4/20 bg-white dark:bg-gray-800">
                <ArrowsUpDownIcon className="h-5 w-5" />
            </div>

            {/* Block floating toolbar */}
            <div className={`absolute -top-4 right-4 flex items-center gap-1.5 z-30 transition-all duration-200 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}`}>
                <div className="flex items-center bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-1 gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Odstranit blok">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {renderContent()}
        </div>
    );
}
