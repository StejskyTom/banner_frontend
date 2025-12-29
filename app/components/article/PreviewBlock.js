import { useSortable } from '@dnd-kit/sortable';
import { useDndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { UserCircleIcon, TrashIcon, ArrowsUpDownIcon } from '@heroicons/react/24/solid';
import ContentEditable from './ContentEditable';

export default function PreviewBlock({ block, isSelected, onClick, onChange, onFormatChange, onDelete }) {
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
                    borderLeft: '4px solid #4f46e5',
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
                        {block.authorTitle && <p className="text-indigo-600 font-medium text-sm m-0 mb-1">{block.authorTitle}</p>}
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
                        ? 'border-indigo-500 ring-4 ring-indigo-500/10 z-10'
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
                        absolute -top-9 left-0 p-2 bg-white text-gray-400 hover:text-indigo-600 rounded-full shadow-sm border border-gray-200 transition-all cursor-move touch-none z-20 flex items-center justify-center
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
