'use client';

import { useRef, useState, useEffect } from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, CheckIcon, ArrowsUpDownIcon } from '@heroicons/react/24/solid';

const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Drag Handle Component
const DragHandle = ({ listeners, attributes }) => (
    <button
        className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-visualy-accent-4 hover:bg-white rounded-full shadow-sm hover:shadow-md border border-gray-200 hover:border-visualy-accent-4/30 cursor-grab active:cursor-grabbing transition-all z-20 opacity-0 group-hover:opacity-100 transform hover:scale-105"
        {...listeners}
        {...attributes}
        title="Přetáhnout pro změnu pořadí"

    >
        <ArrowsUpDownIcon className="w-4 h-4" />
    </button>
);

const formatPrice = (price, format) => {
    if (!price) return '';
    // Expected price input might be string like "1234.56" or number
    let numPrice = parseFloat(price.toString().replace(/\s/g, '').replace(',', '.'));
    if (isNaN(numPrice)) return price;

    if (format === 'no_decimals') {
        return Math.round(numPrice).toLocaleString('cs-CZ');
    }

    const formatted = numPrice.toLocaleString('cs-CZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    if (format === 'dot') {
        return formatted.replace(',', '.');
    }

    // Default 'comma', cs-CZ uses comma by default
    return formatted;
};

function SortableProductItem({
    product,
    onRemove,
    buttonText,
    buttonColor,
    cardBorderRadius,
    cardBackgroundColor,
    productNameColor,
    productNameSize,
    productNameFont,
    productNameBold,
    productNameItalic,
    productNameFull,
    priceColor,
    priceSize,
    priceFont,
    priceBold,
    priceItalic,
    priceFormat,
    buttonTextColor,
    buttonFontSize,
    buttonFont,
    buttonBold,
    buttonItalic,
    cardShadowEnabled,
    cardShadowColor,
    cardShadowBlur,
    cardShadowOpacity,
    cardBorderEnabled,
    cardBorderColor,
    cardBorderWidth,
    cardPaddingX,
    cardPaddingY,
    imageHeight,
    imageObjectFit,
    imagePadding,
    imageMarginBottom,
    imageBorderRadius,

    productNameMarginTop,
    productNameMarginBottom,
    priceMarginTop,
    priceMarginBottom,
    buttonMarginTop,
    buttonMarginBottom,

    buttonBorderRadius,
    onProductNameChange,
    onProductDescriptionChange,
    isEditing,
    onEditStart,
    onEditCancel,
    onEditSave,
    tempName,
    setTempName,

    descriptionEnabled,
    descriptionTag,
    descriptionColor,
    descriptionSize,
    descriptionFont,
    descriptionBold,
    descriptionItalic,
    descriptionAlign,
    descriptionMarginTop,

    descriptionMarginBottom,
    descriptionTruncateLength,

    isEditingDescription,
    onDescriptionEditStart,
    onDescriptionEditCancel,
    onDescriptionEditSave,
    tempDescription,
    setTempDescription

}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: product.id });

    const textareaRef = useRef(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [isEditing, tempName]);

    const descriptionRef = useRef(null);
    useEffect(() => {
        if (isEditingDescription && descriptionRef.current) {
            descriptionRef.current.style.height = 'auto';
            descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
        }
    }, [isEditingDescription, tempDescription]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const shadowStyle = cardShadowEnabled
        ? `0 4px ${cardShadowBlur}px ${hexToRgba(cardShadowColor, cardShadowOpacity / 100)}`
        : 'none';

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                borderRadius: `${cardBorderRadius}px`,
                backgroundColor: cardBackgroundColor,
                boxShadow: shadowStyle,
                border: cardBorderEnabled ? `${cardBorderWidth}px solid ${cardBorderColor}` : 'none',
                padding: `${cardPaddingY}px ${cardPaddingX}px`
            }}
            className={`group relative transition-all duration-300 flex flex-col h-full bg-white ${!cardShadowEnabled ? 'hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]' : ''}`}
        >
            <DragHandle listeners={listeners} attributes={attributes} />

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(product);
                }}
                className="absolute top-2 right-2 p-1.5 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Odebrat z výběru"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <XMarkIcon className="h-4 w-4" />
            </button>

            <div
                className="flex items-center justify-center relative overflow-hidden bg-white"
                style={{
                    height: `${imageHeight}px`,
                    marginBottom: `${imageMarginBottom}px`,
                    padding: `${imagePadding}px`,
                    borderRadius: `${imageBorderRadius}px`
                }}
            >
                {product.imgUrl ? (
                    <img
                        src={product.imgUrl}
                        alt={product.productName}
                        className="max-w-full max-h-full pointer-events-none transition-transform duration-300 group-hover:scale-105"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: imageObjectFit
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs bg-gray-50 rounded-lg">
                        Bez obrázku
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col min-h-0 pointer-events-auto text-center">
                <div className="relative group/name">
                    {isEditing ? (
                        <div className="flex items-center justify-center gap-2 mb-3 min-h-[44px]">
                            <textarea
                                ref={textareaRef}
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="w-full text-center bg-white border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 px-1 py-0 resize-none overflow-hidden"
                                style={{
                                    color: productNameColor,
                                    fontSize: productNameSize,
                                    fontFamily: productNameFont,
                                    fontWeight: productNameBold ? 'bold' : 'normal',
                                    fontStyle: productNameItalic ? 'italic' : 'normal',
                                    marginTop: `${productNameMarginTop}px`,
                                    marginBottom: `${productNameMarginBottom}px`,
                                    lineHeight: '1.625', // matching leading-relaxed
                                    minHeight: '44px' // matching min-h-[44px]
                                }}
                                rows={1}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        onEditSave();
                                    }
                                    if (e.key === 'Escape') {
                                        onEditCancel();
                                    }
                                }}
                                onBlur={() => {
                                    // Small delay to allow other events (like cancel on escape) to process
                                    setTimeout(onEditSave, 50);
                                }}
                            />
                        </div>
                    ) : (
                        <div
                            className="relative inline-block max-w-full cursor-text hover:bg-gray-50/50 rounded -mx-1 px-1 transition-colors data-[is-dragged='true']:cursor-grabbing"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onEditStart(product);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <h3
                                className={`mb-3 leading-relaxed ${productNameFull ? '' : 'line-clamp-2 min-h-[44px]'}`}
                                title={product.productName}
                                style={{
                                    color: productNameColor,
                                    fontSize: productNameSize,
                                    fontFamily: productNameFont,
                                    fontWeight: productNameBold ? 'bold' : 'normal',
                                    fontStyle: productNameItalic ? 'italic' : 'normal',
                                    marginTop: `${productNameMarginTop}px`,
                                    marginBottom: `${productNameMarginBottom}px`
                                }}
                            >
                                {product.productName}
                            </h3>
                            <button
                                className="absolute -right-6 top-0 opacity-0 group-hover/name:opacity-100 transition-opacity p-1 text-gray-400 hover:text-indigo-600 bg-white/80 rounded-full shadow-sm z-10"
                                title="Upravit název"
                            >
                                <PencilSquareIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Description */}
                    {descriptionEnabled && (
                        <div className="relative group/desc">
                            {isEditingDescription ? (
                                <div className="flex items-center justify-center gap-2 mb-3 min-h-[44px]">
                                    <textarea
                                        ref={descriptionRef}
                                        value={tempDescription}
                                        onChange={(e) => setTempDescription(e.target.value)}
                                        className="w-full text-center bg-white border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 px-1 py-0 resize-none overflow-hidden"
                                        style={{
                                            color: descriptionColor,
                                            fontSize: descriptionSize,
                                            fontFamily: descriptionFont,
                                            fontWeight: descriptionBold ? 'bold' : 'normal',
                                            fontStyle: descriptionItalic ? 'italic' : 'normal',
                                            textAlign: descriptionAlign,
                                            marginTop: `${descriptionMarginTop}px`,
                                            marginBottom: `${descriptionMarginBottom}px`,
                                            lineHeight: '1.625',
                                            minHeight: '24px'
                                        }}
                                        rows={1}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                onDescriptionEditSave();
                                            }
                                            if (e.key === 'Escape') {
                                                onDescriptionEditCancel();
                                            }
                                        }}
                                        onBlur={() => {
                                            setTimeout(onDescriptionEditSave, 50);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => e.stopPropagation()}
                                    />
                                </div>
                            ) : (
                                <div
                                    className="relative inline-block max-w-full cursor-text hover:bg-gray-50/50 rounded -mx-1 px-1 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onDescriptionEditStart(product);
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    {(() => {
                                        const DescTag = descriptionTag || 'p';
                                        const rawDesc = product.description || 'Bez popisu';
                                        const truncateLen = descriptionTruncateLength || 100;

                                        let finalDesc = rawDesc;
                                        if (rawDesc.length > truncateLen && !isEditingDescription) {
                                            finalDesc = rawDesc.substring(0, truncateLen) + '...';
                                        }

                                        return (
                                            <DescTag
                                                className="mb-3 leading-relaxed"
                                                title={rawDesc}
                                                style={{
                                                    color: descriptionColor,
                                                    fontSize: descriptionSize,
                                                    fontFamily: descriptionFont,
                                                    fontWeight: descriptionBold ? 'bold' : 'normal',
                                                    fontStyle: descriptionItalic ? 'italic' : 'normal',
                                                    textAlign: descriptionAlign,
                                                    marginTop: `${descriptionMarginTop}px`,
                                                    marginBottom: `${descriptionMarginBottom}px`
                                                }}
                                            >
                                                {finalDesc}
                                            </DescTag>
                                        );
                                    })()}
                                    <button
                                        className="absolute -right-6 top-0 opacity-0 group-hover/desc:opacity-100 transition-opacity p-1 text-gray-400 hover:text-indigo-600 bg-white/80 rounded-full shadow-sm z-10"
                                        title="Upravit popis"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-auto flex flex-col items-center w-full">
                    <span
                        className="tracking-tight mb-4"
                        style={{
                            color: priceColor,
                            fontSize: priceSize,
                            fontFamily: priceFont,
                            fontWeight: priceBold ? 'bold' : 'normal',
                            fontStyle: priceItalic ? 'italic' : 'normal',
                            marginTop: `${priceMarginTop}px`,
                            marginBottom: `${priceMarginBottom}px`
                        }}
                    >
                        {formatPrice(product.priceVat, priceFormat)} Kč
                    </span>

                    <span
                        className="w-full py-3 px-6 rounded-xl transition-all hover:brightness-90 hover:-translate-y-px flex items-center justify-center"
                        style={{
                            backgroundColor: buttonColor,
                            color: buttonTextColor,
                            fontSize: buttonFontSize,
                            fontFamily: buttonFont,
                            fontWeight: buttonBold ? 'bold' : 'normal',
                            fontStyle: buttonItalic ? 'italic' : 'normal',
                            marginTop: `${buttonMarginTop}px`,
                            marginBottom: `${buttonMarginBottom}px`,
                            borderRadius: `${buttonBorderRadius}px`
                        }}
                    >
                        {buttonText}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function HeurekaPreview({
    selectedProductDetails,
    onRemoveProduct,
    layout,
    gridColumns,
    buttonText,
    buttonColor,
    cardBorderRadius,
    cardBackgroundColor,
    productNameColor,
    productNameSize,
    productNameFont,
    productNameBold,
    productNameItalic,
    productNameFull,
    priceColor,
    priceSize,
    priceFont,
    priceBold,
    priceItalic,
    priceFormat,
    buttonTextColor,
    buttonFontSize,
    buttonFont,
    buttonBold,
    buttonItalic,
    cardShadowEnabled,
    cardShadowColor,
    cardShadowBlur,
    cardShadowOpacity,
    cardBorderEnabled,
    cardBorderColor,
    cardBorderWidth,
    cardPaddingX,
    cardPaddingY,

    productNameMarginTop,
    productNameMarginBottom,
    priceMarginTop,
    priceMarginBottom,
    buttonMarginTop,
    buttonMarginBottom,
    buttonBorderRadius,
    imageHeight,
    imageObjectFit,
    imagePadding,
    imageMarginBottom,
    imageBorderRadius,



    widgetTitle,
    widgetTitleTag,
    widgetTitleBold,
    widgetTitleItalic,
    widgetTitleColor,
    widgetTitleSize,
    widgetTitleFont,
    widgetTitleAlign,
    widgetTitleMarginBottom,

    carouselArrows,
    carouselDots,
    carouselDotsColor,
    carouselDotsActiveColor,

    carouselDotsMarginTop,
    carouselArrowsBackground,
    carouselArrowsColor,
    carouselArrowsBorderRadius,
    onProductNameChange,
    onProductDescriptionChange,
    descriptionEnabled,
    descriptionTag,
    descriptionColor,
    descriptionSize,
    descriptionFont,
    descriptionBold,
    descriptionItalic,
    descriptionAlign,
    descriptionMarginTop,
    descriptionMarginBottom,
    descriptionTruncateLength,
}) {
    const Tag = widgetTitleTag || 'h2';
    const scrollContainerRef = useRef(null);
    const [activeDot, setActiveDot] = useState(0);
    const [activeId, setActiveId] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);
    const [tempProductName, setTempProductName] = useState('');

    const [editingDescriptionId, setEditingDescriptionId] = useState(null);
    const [tempDescription, setTempDescription] = useState('');

    const handleEditStart = (product) => {
        setEditingProductId(product.id);
        setTempProductName(product.productName);
    };

    const handleEditCancel = () => {
        setEditingProductId(null);
        setTempProductName('');
    };

    const handleEditSave = () => {
        if (editingProductId && onProductNameChange) {
            onProductNameChange(editingProductId, tempProductName);
        }
        setEditingProductId(null);
        setTempProductName('');
    };

    // Description Handlers
    const handleDescriptionEditStart = (product) => {
        setEditingDescriptionId(product.id);
        setTempDescription(product.description || '');
    };

    const handleDescriptionEditCancel = () => {
        setEditingDescriptionId(null);
        setTempDescription('');
    };

    const handleDescriptionEditSave = () => {
        if (editingDescriptionId && onProductDescriptionChange) {
            onProductDescriptionChange(editingDescriptionId, tempDescription);
        }
        setEditingDescriptionId(null);
        setTempDescription('');
    };

    useEffect(() => {
        const handleScroll = () => {
            if (!scrollContainerRef.current || layout !== 'carousel') return;

            const container = scrollContainerRef.current;
            const item = container.firstElementChild;
            const itemWidth = item ? (item.clientWidth + 24) : 0;

            if (itemWidth > 0) {
                const scrollLeft = container.scrollLeft;
                const newActiveDot = Math.round(scrollLeft / itemWidth);
                const maxDots = Math.max(0, selectedProductDetails.length - gridColumns);
                setActiveDot(Math.min(newActiveDot, maxDots));
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [layout, selectedProductDetails.length, gridColumns]);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const item = container.firstElementChild;
            const scrollAmount = item ? (item.clientWidth + 24) : 300; // 24px is gap-6
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const item = container.firstElementChild;
            const scrollAmount = item ? (item.clientWidth + 24) : 300;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            {widgetTitle && (
                <Tag
                    style={{
                        color: widgetTitleColor,
                        fontSize: widgetTitleSize,
                        fontFamily: widgetTitleFont,
                        textAlign: widgetTitleAlign,
                        fontWeight: widgetTitleBold ? 'bold' : 'normal',
                        fontStyle: widgetTitleItalic ? 'italic' : 'normal',
                        marginBottom: `${widgetTitleMarginBottom}px`
                    }}
                    className="tracking-tight"
                >
                    {widgetTitle}
                </Tag>
            )}
            {selectedProductDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                    <p>Zatím žádné vybrané produkty</p>
                    <p className="text-sm">Vyberte produkty v levém panelu</p>
                </div>
            ) : (
                <div className="p-8 min-h-[400px]">
                    <SortableContext items={selectedProductDetails.map(p => p.id)} strategy={rectSortingStrategy}>
                        <div className="relative group">
                            {layout === 'carousel' && carouselArrows && (
                                <>
                                    <button
                                        onClick={scrollLeft}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 shadow-lg p-2 hover:brightness-95 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 disabled:cursor-not-allowed hidden md:block"
                                        aria-label="Scroll left"
                                        style={{
                                            backgroundColor: carouselArrowsBackground || '#ffffff',
                                            color: carouselArrowsColor || '#374151',
                                            borderRadius: `${carouselArrowsBorderRadius !== undefined ? carouselArrowsBorderRadius : 50}%`
                                        }}
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={scrollRight}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 shadow-lg p-2 hover:brightness-95 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0 disabled:cursor-not-allowed hidden md:block"
                                        aria-label="Scroll right"
                                        style={{
                                            backgroundColor: carouselArrowsBackground || '#ffffff',
                                            color: carouselArrowsColor || '#374151',
                                            borderRadius: `${carouselArrowsBorderRadius !== undefined ? carouselArrowsBorderRadius : 50}%`
                                        }}
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                            <div
                                ref={scrollContainerRef}
                                className={layout === 'carousel'
                                    ? "flex gap-6 overflow-x-auto pb-6 pt-2 snap-x scrollbar-hide items-stretch"
                                    : "grid gap-6"
                                }
                                style={layout === 'grid' ? {
                                    gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
                                } : {}}
                            >
                                {selectedProductDetails.map((product) => (
                                    <div
                                        key={product.id}
                                        className={layout === 'carousel' ? "snap-start shrink-0 flex flex-col" : ""}
                                        style={layout === 'carousel' ? {
                                            minWidth: `calc((100% - (${gridColumns} - 1) * 24px) / ${gridColumns})`,
                                            maxWidth: `calc((100% - (${gridColumns} - 1) * 24px) / ${gridColumns})`
                                        } : {}}
                                    >
                                        <SortableProductItem
                                            product={product}
                                            onRemove={onRemoveProduct}
                                            onProductNameChange={onProductNameChange}
                                            onProductDescriptionChange={onProductDescriptionChange}
                                            isEditing={editingProductId === product.id}
                                            onEditStart={handleEditStart}
                                            onEditCancel={handleEditCancel}
                                            onEditSave={handleEditSave}
                                            tempName={tempProductName}
                                            setTempName={setTempProductName}

                                            isEditingDescription={editingDescriptionId === product.id}
                                            onDescriptionEditStart={handleDescriptionEditStart}
                                            onDescriptionEditCancel={handleDescriptionEditCancel}
                                            onDescriptionEditSave={handleDescriptionEditSave}
                                            tempDescription={tempDescription}
                                            setTempDescription={setTempDescription}

                                            layout={layout}
                                            buttonText={buttonText}
                                            buttonColor={buttonColor}
                                            cardBorderRadius={cardBorderRadius}
                                            cardBackgroundColor={cardBackgroundColor}
                                            productNameColor={productNameColor}
                                            productNameSize={productNameSize}
                                            productNameFont={productNameFont}
                                            productNameBold={productNameBold}
                                            productNameItalic={productNameItalic}
                                            productNameFull={productNameFull}

                                            descriptionEnabled={descriptionEnabled}
                                            descriptionTag={descriptionTag}
                                            descriptionColor={descriptionColor}
                                            descriptionSize={descriptionSize}
                                            descriptionFont={descriptionFont}
                                            descriptionBold={descriptionBold}
                                            descriptionItalic={descriptionItalic}
                                            descriptionAlign={descriptionAlign}
                                            descriptionMarginTop={descriptionMarginTop}
                                            descriptionMarginBottom={descriptionMarginBottom}
                                            descriptionTruncateLength={descriptionTruncateLength}

                                            priceColor={priceColor}
                                            priceSize={priceSize}
                                            priceFont={priceFont}
                                            priceBold={priceBold}
                                            priceItalic={priceItalic}
                                            priceFormat={priceFormat}
                                            buttonTextColor={buttonTextColor}
                                            buttonFontSize={buttonFontSize}
                                            buttonFont={buttonFont}
                                            buttonBold={buttonBold}
                                            buttonItalic={buttonItalic}
                                            cardShadowEnabled={cardShadowEnabled}
                                            cardShadowColor={cardShadowColor}
                                            cardShadowBlur={cardShadowBlur}
                                            cardShadowOpacity={cardShadowOpacity}
                                            cardBorderEnabled={cardBorderEnabled}
                                            cardBorderColor={cardBorderColor}
                                            cardBorderWidth={cardBorderWidth}
                                            productNameMarginTop={productNameMarginTop}
                                            productNameMarginBottom={productNameMarginBottom}
                                            priceMarginTop={priceMarginTop}
                                            priceMarginBottom={priceMarginBottom}
                                            buttonMarginTop={buttonMarginTop}
                                            buttonMarginBottom={buttonMarginBottom}
                                            buttonBorderRadius={buttonBorderRadius}
                                            imageHeight={imageHeight}
                                            imageObjectFit={imageObjectFit}
                                            imagePadding={imagePadding}
                                            imageMarginBottom={imageMarginBottom}
                                            imageBorderRadius={imageBorderRadius}
                                            cardPaddingX={cardPaddingX}
                                            cardPaddingY={cardPaddingY}
                                        />
                                    </div>
                                ))}
                            </div>

                            {layout === 'carousel' && carouselDots && (
                                <div
                                    className="flex justify-center gap-2 items-center"
                                    style={{ marginTop: `${carouselDotsMarginTop}px` }}
                                >
                                    {Array.from({ length: Math.max(0, selectedProductDetails.length - gridColumns) + 1 }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (scrollContainerRef.current) {
                                                    const container = scrollContainerRef.current;
                                                    const item = container.firstElementChild;
                                                    const itemWidth = item ? (item.clientWidth + 24) : 0;
                                                    if (itemWidth > 0) {
                                                        container.scrollTo({ left: i * itemWidth, behavior: 'smooth' });
                                                    }
                                                }
                                            }}
                                            className="rounded-full transition-all duration-200"
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                backgroundColor: i === activeDot ? carouselDotsActiveColor : carouselDotsColor,
                                                transform: i === activeDot ? 'scale(1.2)' : 'scale(1)'
                                            }}
                                            aria-label={`Go to item ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </div>
            )}
        </div>
    );
}
