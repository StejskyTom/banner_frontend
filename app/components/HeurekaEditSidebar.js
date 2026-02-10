'use client';

import { useState } from 'react';
import {
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid';
import { SwatchIcon, BoldIcon, ItalicIcon } from '@heroicons/react/24/outline';
import RangeSlider from './RangeSlider';
import Toggle from './Toggle';
const ToolButton = ({ active, children, onClick, title }) => (
    <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={`p-2 rounded-md transition-all font-medium text-sm border flex items-center justify-center h-8 min-w-[32px] flex-1
            ${active
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 hover:border-gray-600'
            }`}
        title={title}
    >
        {children}
    </button>
);

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
            {label && <label className="text-xs font-medium text-gray-400 mb-2 block">{label}</label>}
            <div className="relative group">
                <div className="relative flex items-center h-10 w-full rounded-md border border-gray-600 shadow-sm overflow-hidden ring-1 ring-white/5 transition-all focus-within:ring-1 focus-within:ring-green-500">
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

const CollapsibleSection = ({ title, children, isOpen, onToggle }) => {
    return (
        <div className={`group rounded-xl transition-all duration-300 border ${isOpen ? 'bg-gray-800 border-gray-600 shadow-lg my-2' : 'border-transparent'}`}>
            <div
                onClick={onToggle}
                className={`flex items-center justify-between cursor-pointer list-none text-xs font-bold uppercase px-3 py-3 select-none leading-none tracking-wider rounded-xl transition-colors ${isOpen ? 'text-white bg-gray-700/50 rounded-b-none' : 'text-gray-300 hover:text-white hover:bg-gray-800/30'}`}
            >
                <span className="translate-y-[1px]">{title}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="space-y-4 px-3 py-4 border-t border-gray-700/30">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TypographyControls = ({
    color, setColor,
    size, setSize,
    font, setFont,
    bold, setBold,
    italic, setItalic
}) => {


    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-1 items-center mb-3">
                <ToolButton onClick={() => setBold(!bold)} active={bold} title="Tučně">
                    <BoldIcon className="w-4 h-4" />
                </ToolButton>
                <ToolButton onClick={() => setItalic(!italic)} active={italic} title="Kurzíva">
                    <ItalicIcon className="w-4 h-4" />
                </ToolButton>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="relative">
                    <ColorInput
                        value={color}
                        onChange={setColor}
                    />
                </div>
                <select
                    className="h-10 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4"
                    onChange={(e) => setSize(e.target.value)}
                    value={size}
                >
                    <option value="12px">12px</option>
                    <option value="13px">13px</option>
                    <option value="14px">14px</option>
                    <option value="15px">15px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                </select>

                <select
                    className="h-10 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4 col-span-2"
                    onChange={(e) => setFont(e.target.value)}
                    value={font}
                >
                    <option value="sans-serif">Sans Serif</option>
                    <option value="system-ui">System UI</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Courier New, monospace">Courier</option>
                </select>
            </div>
        </div>
    );
};

export default function HeurekaEditSidebar({
    activeTab,
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    handleSearch,
    applyFilters,
    loading,
    selectedProducts,
    toggleProductSelection,
    page,
    setPage,
    totalPages,
    layout,
    setLayout,
    gridColumns,
    setGridColumns,
    mobileGridColumns,
    setMobileGridColumns,

    carouselArrows,
    setCarouselArrows,
    carouselArrowsBackground,
    setCarouselArrowsBackground,
    carouselArrowsColor,
    setCarouselArrowsColor,
    carouselArrowsBorderRadius,
    setCarouselArrowsBorderRadius,
    carouselDots,
    setCarouselDots,
    carouselDotsColor,
    setCarouselDotsColor,
    carouselDotsActiveColor,
    setCarouselDotsActiveColor,
    carouselDotsMarginTop,
    setCarouselDotsMarginTop,
    widgetTitle,
    setWidgetTitle,
    widgetTitleTag,
    setWidgetTitleTag,
    widgetTitleBold,
    setWidgetTitleBold,
    widgetTitleItalic,
    setWidgetTitleItalic,
    widgetTitleColor,
    setWidgetTitleColor,
    widgetTitleSize,
    setWidgetTitleSize,
    widgetTitleFont,
    setWidgetTitleFont,
    widgetTitleAlign,
    setWidgetTitleAlign,
    widgetTitleMarginBottom,
    setWidgetTitleMarginBottom,
    buttonColor,
    setButtonColor,
    buttonText,
    setButtonText,
    cardBorderRadius,
    setCardBorderRadius,
    cardBackgroundColor,
    setCardBackgroundColor,
    productNameColor,
    setProductNameColor,
    productNameSize,
    setProductNameSize,
    productNameFont,
    setProductNameFont,
    productNameBold,
    setProductNameBold,
    productNameItalic,
    setProductNameItalic,
    productNameFull,
    setProductNameFull,
    productNameMarginTop,
    setProductNameMarginTop,
    productNameMarginBottom,
    setProductNameMarginBottom,

    descriptionEnabled,
    setDescriptionEnabled,
    descriptionTag,
    setDescriptionTag,
    descriptionColor,
    setDescriptionColor,
    descriptionSize,
    setDescriptionSize,
    descriptionFont,
    setDescriptionFont,
    descriptionBold,
    setDescriptionBold,
    descriptionItalic,
    setDescriptionItalic,
    descriptionAlign,
    setDescriptionAlign,
    descriptionMarginTop,
    setDescriptionMarginTop,
    descriptionMarginBottom,
    setDescriptionMarginBottom,
    descriptionTruncateLength,
    setDescriptionTruncateLength,

    priceColor,
    setPriceColor,
    priceSize,
    setPriceSize,
    priceFont,
    setPriceFont,
    priceBold,
    setPriceBold,
    priceItalic,
    setPriceItalic,
    priceFormat,
    setPriceFormat,
    buttonTextColor,
    setButtonTextColor,
    buttonFontSize,
    setButtonFontSize,
    buttonFont,
    setButtonFont,
    buttonBold,
    setButtonBold,
    buttonItalic,
    setButtonItalic,
    cardShadowEnabled,
    setCardShadowEnabled,
    cardShadowColor,
    setCardShadowColor,
    cardShadowBlur,
    setCardShadowBlur,
    cardShadowOpacity,
    setCardShadowOpacity,
    cardBorderEnabled,
    setCardBorderEnabled,
    cardBorderColor,
    setCardBorderColor,
    cardBorderWidth,
    setCardBorderWidth,

    priceMarginTop,
    setPriceMarginTop,
    priceMarginBottom,
    setPriceMarginBottom,
    buttonMarginTop,
    setButtonMarginTop,
    buttonMarginBottom,
    setButtonMarginBottom,
    buttonBorderRadius,
    setButtonBorderRadius,

    imageHeight,
    setImageHeight,
    imageObjectFit,
    setImageObjectFit,
    imagePadding,
    setImagePadding,
    imageMarginBottom,
    setImageMarginBottom,
    imageBorderRadius,
    setImageBorderRadius,
    cardPaddingX,
    setCardPaddingX,
    cardPaddingY,
    setCardPaddingY




}) {
    const [openSections, setOpenSections] = useState({});
    const [autoClose, setAutoClose] = useState(true);

    const toggleSection = (id) => {
        setOpenSections(prev => {
            const isCurrentlyOpen = !!prev[id];
            if (autoClose) {
                return isCurrentlyOpen ? {} : { [id]: true };
            } else {
                return { ...prev, [id]: !isCurrentlyOpen };
            }
        });
    };
    if (!activeTab) return null;

    return (
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full shrink-0 z-10 shadow-xl overflow-hidden text-gray-300">
            {activeTab === 'content' && (
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800">
                        {/* Widget Title */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-3">Nadpis widgetu</label>
                            <input
                                type="text"
                                value={widgetTitle}
                                onChange={(e) => setWidgetTitle(e.target.value)}
                                placeholder="Např. Doporučujeme"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                        </div>

                        <div className="h-px bg-gray-800 mb-6" />

                        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-4">Výběr produktů</h2>

                        {/* Search */}
                        <div className="relative mb-3">
                            <input
                                type="text"
                                placeholder="Hledat produkt..."
                                value={searchTerm}
                                onChange={handleSearch}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all text-white placeholder-gray-500"
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute left-3 top-2.5" />
                        </div>

                        {/* Category Filter */}
                        <div className="mb-3">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all text-sm text-white"
                            >
                                <option value="all">Všechny kategorie</option>
                                {categories.map((cat, index) => (
                                    <option key={`${cat.id}-${index}`} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={applyFilters}
                            className="w-full py-2 bg-visualy-accent-4 text-white rounded-lg hover:bg-visualy-accent-4/90 transition-colors font-medium text-sm shadow-sm"
                        >
                            Filtrovat
                        </button>
                    </div>

                    {/* Product List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 [scrollbar-width:thin] [scrollbar-color:rgb(55,65,81)_transparent]">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-visualy-accent-4"></div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Žádné produkty nenalezeny
                            </div>
                        ) : (
                            products.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => toggleProductSelection(product)}
                                    className={`
                                        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all group relative
                                        ${selectedProducts.has(product.id)
                                            ? 'bg-visualy-accent-4/10 border-visualy-accent-4/50 ring-1 ring-visualy-accent-4/30'
                                            : 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <div className="w-12 h-12 shrink-0 bg-white rounded border border-gray-200 p-1 flex items-center justify-center">
                                        {product.imgUrl ? (
                                            <img src={product.imgUrl} alt="" className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 rounded" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-white truncate pr-6" title={product.productName}>
                                            {product.productName}
                                        </h3>
                                        <p className="text-xs text-green-400 font-bold mt-0.5">
                                            {product.priceVat} Kč
                                        </p>
                                    </div>
                                    {selectedProducts.has(product.id) && (
                                        <div className="absolute top-3 right-3 text-visualy-accent-4">
                                            <CheckCircleIcon className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-800 bg-gray-900 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-all text-gray-400"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-400">
                            Strana {page} z {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-all text-gray-400"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <>
                    <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                        <div>
                            <CollapsibleSection title="Nastavení nadpisu" isOpen={!!openSections['widget-title']} onToggle={() => toggleSection('widget-title')}>
                                <div className="space-y-4">
                                    {/* Tag & Formatting Buttons */}
                                    <div className="flex flex-wrap gap-1 items-center mb-3">
                                        <ToolButton onClick={() => setWidgetTitleTag('p')} active={widgetTitleTag === 'p'} title="Normal Text">T</ToolButton>
                                        <ToolButton onClick={() => setWidgetTitleTag('h1')} active={widgetTitleTag === 'h1'} title="H1">H1</ToolButton>
                                        <ToolButton onClick={() => setWidgetTitleTag('h2')} active={widgetTitleTag === 'h2'} title="H2">H2</ToolButton>
                                        <ToolButton onClick={() => setWidgetTitleTag('h3')} active={widgetTitleTag === 'h3'} title="H3">H3</ToolButton>

                                        <div className="w-px h-8 bg-gray-700 mx-1" />

                                        <ToolButton onClick={() => setWidgetTitleBold(!widgetTitleBold)} active={widgetTitleBold} title="Tučně">
                                            <BoldIcon className="w-4 h-4" />
                                        </ToolButton>
                                        <ToolButton onClick={() => setWidgetTitleItalic(!widgetTitleItalic)} active={widgetTitleItalic} title="Kurzíva">
                                            <ItalicIcon className="w-4 h-4" />
                                        </ToolButton>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="relative">
                                            <ColorInput
                                                value={widgetTitleColor}
                                                onChange={setWidgetTitleColor}
                                            />
                                        </div>
                                        <select
                                            className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                                            onChange={(e) => setWidgetTitleSize(e.target.value)}
                                            value={widgetTitleSize}
                                        >
                                            <option value="16px">16px</option>
                                            <option value="18px">18px</option>
                                            <option value="20px">20px</option>
                                            <option value="24px">24px</option>
                                            <option value="32px">32px</option>
                                            <option value="48px">48px</option>
                                        </select>

                                        <select
                                            className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                                            onChange={(e) => setWidgetTitleFont(e.target.value)}
                                            value={widgetTitleFont}
                                        >
                                            <option value="inherit">Výchozí</option>
                                            <option value="sans-serif">Sans Serif</option>
                                            <option value="system-ui">System UI</option>
                                            <option value="Arial, sans-serif">Arial</option>
                                            <option value="Georgia, serif">Georgia</option>
                                            <option value="Courier New, monospace">Courier</option>
                                        </select>
                                        <select
                                            className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                                            onChange={(e) => setWidgetTitleAlign(e.target.value)}
                                            value={widgetTitleAlign}
                                        >
                                            <option value="left">Vlevo</option>
                                            <option value="center">Na střed</option>
                                            <option value="right">Vpravo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-medium text-gray-400">Spodní odsazení ({widgetTitleMarginBottom}px)</label>
                                        </div>
                                        <RangeSlider
                                            min={0}
                                            max={100}
                                            step={4}
                                            value={widgetTitleMarginBottom}
                                            onChange={(e) => setWidgetTitleMarginBottom(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection title="Nastavení vzhledu" isOpen={!!openSections['layout']} onToggle={() => toggleSection('layout')}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setLayout('carousel')}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${layout === 'carousel'
                                                ? 'border-visualy-accent-4 bg-green-900/20 ring-1 ring-visualy-accent-4/20'
                                                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                                                }`}
                                        >
                                            <div className="font-medium text-white mb-1">Carousel</div>
                                            <div className="text-xs text-gray-400">Produkty v posuvném pásu</div>
                                        </button>
                                        <button
                                            onClick={() => setLayout('grid')}
                                            className={`p-3 rounded-xl border-2 text-left transition-all ${layout === 'grid'
                                                ? 'border-visualy-accent-4 bg-green-900/20 ring-1 ring-visualy-accent-4/20'
                                                : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                                                }`}
                                        >
                                            <div className="font-medium text-white mb-1">Mřížka</div>
                                            <div className="text-xs text-gray-400">Statická mřížka produktů</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Grid Columns */}
                                <div className="space-y-6 pt-4 border-t border-gray-800">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-gray-300">
                                                {layout === 'carousel' ? 'Počet položek (Desktop)' : 'Sloupce (Desktop)'}
                                            </label>
                                            <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">{gridColumns}</span>
                                        </div>
                                        <RangeSlider
                                            min={1}
                                            max={6}
                                            step={1}
                                            value={gridColumns}
                                            onChange={(e) => setGridColumns(parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-gray-300">
                                                {layout === 'carousel' ? 'Počet položek (Mobil)' : 'Sloupce (Mobil)'}
                                            </label>
                                            <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">{mobileGridColumns}</span>
                                        </div>
                                        <RangeSlider
                                            min={1}
                                            max={3}
                                            step={1}
                                            value={mobileGridColumns}
                                            onChange={(e) => setMobileGridColumns(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {layout === 'carousel' && (
                                    <div className="space-y-4 pt-4 border-t border-gray-800">


                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-300">Zobrazit šipky</label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={carouselArrows}
                                                    onChange={(e) => setCarouselArrows(e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-visualy-accent-4"></div>
                                            </label>
                                        </div>

                                        {carouselArrows && (
                                            <div className="space-y-3 pt-2 mt-2 border-t border-gray-800 mb-4">
                                                <ColorInput
                                                    label="Barva pozadí šipky"
                                                    value={carouselArrowsBackground}
                                                    onChange={setCarouselArrowsBackground}
                                                />
                                                <ColorInput
                                                    label="Barva ikony šipky"
                                                    value={carouselArrowsColor}
                                                    onChange={setCarouselArrowsColor}
                                                />
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-xs font-medium text-gray-400">Zakulacení šipek ({carouselArrowsBorderRadius}%)</label>
                                                    </div>
                                                    <RangeSlider
                                                        min={0}
                                                        max={50}
                                                        step={1}
                                                        value={carouselArrowsBorderRadius}
                                                        onChange={(e) => setCarouselArrowsBorderRadius(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-300">Zobrazit tečky</label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={carouselDots}
                                                    onChange={(e) => setCarouselDots(e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-visualy-accent-4"></div>
                                            </label>
                                        </div>
                                        {carouselDots && (
                                            <div className="space-y-3 pt-2 mt-2 border-t border-gray-800">
                                                <ColorInput
                                                    label="Barva teček (neaktivní)"
                                                    value={carouselDotsColor}
                                                    onChange={setCarouselDotsColor}
                                                />
                                                <ColorInput
                                                    label="Barva tečky (aktivní)"
                                                    value={carouselDotsActiveColor}
                                                    onChange={setCarouselDotsActiveColor}
                                                />
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-xs font-medium text-gray-400">Horní odsazení teček ({carouselDotsMarginTop}px)</label>
                                                    </div>
                                                    <RangeSlider
                                                        min={0}
                                                        max={64}
                                                        step={4}
                                                        value={carouselDotsMarginTop}
                                                        onChange={(e) => setCarouselDotsMarginTop(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}


                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection title="Nastavení obrázku" isOpen={!!openSections['image']} onToggle={() => toggleSection('image')}>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-gray-300">Výška obrázku ({imageHeight}px)</label>
                                        </div>
                                        <RangeSlider
                                            min={100}
                                            max={400}
                                            step={4}
                                            value={imageHeight}
                                            onChange={(e) => setImageHeight(parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-400 mb-2 block">Přizpůsobení obrázku</label>
                                        <select
                                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all text-sm text-white"
                                            value={imageObjectFit}
                                            onChange={(e) => setImageObjectFit(e.target.value)}
                                        >
                                            <option value="contain">Zobrazit celý (Contain)</option>
                                            <option value="cover">Vyplnit (Cover)</option>
                                            <option value="fill">Roztáhnout (Fill)</option>
                                        </select>
                                    </div>

                                    <div className="pt-2 border-t border-gray-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-gray-300">Vnitřní odsazení ({imagePadding}px)</label>
                                        </div>
                                        <RangeSlider
                                            min={0}
                                            max={32}
                                            step={1}
                                            value={imagePadding}
                                            onChange={(e) => setImagePadding(parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-gray-300">Spodní odsazení ({imageMarginBottom}px)</label>
                                        </div>
                                        <RangeSlider
                                            min={0}
                                            max={64}
                                            step={1}
                                            value={imageMarginBottom}
                                            onChange={(e) => setImageMarginBottom(parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-gray-300">Zaoblení rohů ({imageBorderRadius}px)</label>
                                        </div>
                                        <RangeSlider
                                            min={0}
                                            max={32}
                                            step={1}
                                            value={imageBorderRadius}
                                            onChange={(e) => setImageBorderRadius(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection title="Název produktu" isOpen={!!openSections['product-name']} onToggle={() => toggleSection('product-name')}>
                                <TypographyControls
                                    color={productNameColor}
                                    setColor={setProductNameColor}
                                    size={productNameSize}
                                    setSize={setProductNameSize}
                                    font={productNameFont}
                                    setFont={setProductNameFont}
                                    bold={productNameBold}
                                    setBold={setProductNameBold}
                                    italic={productNameItalic}
                                    setItalic={setProductNameItalic}
                                />

                                <div className="pt-2 border-t border-gray-800">
                                    <Toggle
                                        checked={productNameFull}
                                        onChange={setProductNameFull}
                                        label="Zobrazit celý název"
                                    />
                                </div>
                                <div className="pt-2 border-t border-gray-800 space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-medium text-gray-400">Horní odsazení ({productNameMarginTop}px)</label>
                                        </div>
                                        <RangeSlider
                                            min={0}
                                            max={64}
                                            step={1}
                                            value={productNameMarginTop}
                                            onChange={(e) => setProductNameMarginTop(parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-medium text-gray-400">Spodní odsazení ({productNameMarginBottom}px)</label>
                                        </div>
                                        <RangeSlider
                                            min={0}
                                            max={64}
                                            step={1}
                                            value={productNameMarginBottom}
                                            onChange={(e) => setProductNameMarginBottom(parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection title="Popis produktu" isOpen={!!openSections['description']} onToggle={() => toggleSection('description')}>
                                <div className="space-y-4">
                                    <Toggle checked={descriptionEnabled} onChange={setDescriptionEnabled} label="Zobrazit popis" />

                                    {descriptionEnabled && (
                                        <>


                                            <TypographyControls
                                                color={descriptionColor}
                                                setColor={setDescriptionColor}
                                                size={descriptionSize}
                                                setSize={setDescriptionSize}
                                                font={descriptionFont}
                                                setFont={setDescriptionFont}
                                                bold={descriptionBold}
                                                setBold={setDescriptionBold}
                                                italic={descriptionItalic}
                                                setItalic={setDescriptionItalic}
                                            />

                                            <div className="pt-2 border-t border-gray-800">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-xs font-medium text-gray-400">Zkrátit popis ({descriptionTruncateLength} znaků)</label>
                                                </div>
                                                <RangeSlider
                                                    min={10}
                                                    max={500}
                                                    step={5}
                                                    value={descriptionTruncateLength}
                                                    onChange={(e) => setDescriptionTruncateLength(parseInt(e.target.value))}
                                                />
                                                <div className="text-[10px] text-gray-500 mt-1">
                                                    Omezí délku popisu a přidá "..."
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-gray-800 space-y-4">
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-xs font-medium text-gray-400">Horní odsazení ({descriptionMarginTop}px)</label>
                                                    </div>
                                                    <RangeSlider
                                                        min={0}
                                                        max={64}
                                                        step={1}
                                                        value={descriptionMarginTop}
                                                        onChange={(e) => setDescriptionMarginTop(parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-xs font-medium text-gray-400">Spodní odsazení ({descriptionMarginBottom}px)</label>
                                                    </div>
                                                    <RangeSlider
                                                        min={0}
                                                        max={64}
                                                        step={1}
                                                        value={descriptionMarginBottom}
                                                        onChange={(e) => setDescriptionMarginBottom(parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection title="Cena produktu" isOpen={!!openSections['price']} onToggle={() => toggleSection('price')}>
                                <div className="space-y-4">
                                    <TypographyControls
                                        color={priceColor}
                                        setColor={setPriceColor}
                                        size={priceSize}
                                        setSize={setPriceSize}
                                        font={priceFont}
                                        setFont={setPriceFont}
                                        bold={priceBold}
                                        setBold={setPriceBold}
                                        italic={priceItalic}
                                        setItalic={setPriceItalic}
                                    />

                                    <div className="pt-2 border-t border-gray-800">
                                        <label className="text-xs font-medium text-gray-400 mb-2 block">Formát ceny</label>
                                        <select
                                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 transition-all text-sm text-white"
                                            value={priceFormat}
                                            onChange={(e) => setPriceFormat(e.target.value)}
                                        >
                                            <option value="comma">123,45</option>
                                            <option value="dot">123.45</option>
                                            <option value="no_decimals">123 (bez haléřů)</option>
                                        </select>
                                    </div>

                                    <div className="pt-2 border-t border-gray-800 space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-medium text-gray-400">Horní odsazení ({priceMarginTop}px)</label>
                                            </div>
                                            <RangeSlider
                                                min={0}
                                                max={64}
                                                step={1}
                                                value={priceMarginTop}
                                                onChange={(e) => setPriceMarginTop(parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-medium text-gray-400">Spodní odsazení ({priceMarginBottom}px)</label>
                                            </div>
                                            <RangeSlider
                                                min={0}
                                                max={64}
                                                step={1}
                                                value={priceMarginBottom}
                                                onChange={(e) => setPriceMarginBottom(parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection title="Nastavení tlačítka" isOpen={!!openSections['button']} onToggle={() => toggleSection('button')}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-300 block mb-2">Text tlačítka</label>
                                        <input
                                            type="text"
                                            value={buttonText}
                                            onChange={(e) => setButtonText(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-green-500"
                                        />
                                    </div>

                                    <TypographyControls
                                        color={buttonTextColor}
                                        setColor={setButtonTextColor}
                                        size={buttonFontSize}
                                        setSize={setButtonFontSize}
                                        font={buttonFont}
                                        setFont={setButtonFont}
                                        bold={buttonBold}
                                        setBold={setButtonBold}
                                        italic={buttonItalic}
                                        setItalic={setButtonItalic}
                                    />

                                    <div className="pt-2 border-t border-gray-800">
                                        <ColorInput
                                            label="Pozadí tlačítka"
                                            value={buttonColor}
                                            onChange={setButtonColor}
                                        />
                                    </div>

                                    <div className="pt-2 border-t border-gray-800 space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-medium text-gray-400">Horní odsazení ({buttonMarginTop}px)</label>
                                            </div>
                                            <RangeSlider
                                                min={0}
                                                max={64}
                                                step={1}
                                                value={buttonMarginTop}
                                                onChange={(e) => setButtonMarginTop(parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-medium text-gray-400">Spodní odsazení ({buttonMarginBottom}px)</label>
                                            </div>
                                            <RangeSlider
                                                min={0}
                                                max={64}
                                                step={1}
                                                value={buttonMarginBottom}
                                                onChange={(e) => setButtonMarginBottom(parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-medium text-gray-400">Zaoblení rohů ({buttonBorderRadius}px)</label>
                                            </div>
                                            <RangeSlider
                                                min={0}
                                                max={32}
                                                step={1}
                                                value={buttonBorderRadius}
                                                onChange={(e) => setButtonBorderRadius(parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection title="Nastavení karty produktu" isOpen={!!openSections['product-card']} onToggle={() => toggleSection('product-card')}>
                                <div className="space-y-6">
                                    {/* Card Style Settings */}
                                    <div className="space-y-4">
                                        <Toggle
                                            checked={cardBorderEnabled}
                                            onChange={setCardBorderEnabled}
                                            label="Zobrazit rámeček"
                                        />
                                        {cardBorderEnabled && (
                                            <>
                                                <ColorInput
                                                    label="Barva rámečku"
                                                    value={cardBorderColor}
                                                    onChange={setCardBorderColor}
                                                />
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-sm font-medium text-gray-300">Šířka rámečku ({cardBorderWidth}px)</label>
                                                    </div>
                                                    <RangeSlider
                                                        min={1}
                                                        max={10}
                                                        step={1}
                                                        value={cardBorderWidth}
                                                        onChange={(e) => setCardBorderWidth(parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div className="h-px bg-gray-800" />
                                            </>
                                        )}

                                        <div>
                                            <ColorInput
                                                label="Barva pozadí karty"
                                                value={cardBackgroundColor}
                                                onChange={setCardBackgroundColor}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm font-medium text-gray-300">Odsazení zleva/zprava ({cardPaddingX}px)</label>
                                            </div>
                                            <RangeSlider
                                                min={0}
                                                max={64}
                                                step={2}
                                                value={cardPaddingX}
                                                onChange={(e) => setCardPaddingX(parseInt(e.target.value))}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm font-medium text-gray-300">Odsazení shora/zdola ({cardPaddingY}px)</label>
                                            </div>
                                            <RangeSlider
                                                min={0}
                                                max={64}
                                                step={2}
                                                value={cardPaddingY}
                                                onChange={(e) => setCardPaddingY(parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm font-medium text-gray-300">Zaoblení rohů ({cardBorderRadius}px)</label>
                                            </div>
                                            <RangeSlider
                                                min={0}
                                                max={32}
                                                step={2}
                                                value={cardBorderRadius}
                                                onChange={(e) => setCardBorderRadius(parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                                    {/* Shadow Settings */}
                                    <div className="space-y-4">
                                        <Toggle
                                            checked={cardShadowEnabled}
                                            onChange={setCardShadowEnabled}
                                            label="Stín pod kartou"
                                        />

                                        {cardShadowEnabled && (
                                            <>
                                                <ColorInput
                                                    label="Barva stínu"
                                                    value={cardShadowColor}
                                                    onChange={setCardShadowColor}
                                                />

                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-sm font-medium text-gray-300">Rozmazání stínu ({cardShadowBlur}px)</label>
                                                    </div>
                                                    <RangeSlider
                                                        min={0}
                                                        max={50}
                                                        step={1}
                                                        value={cardShadowBlur}
                                                        onChange={(e) => setCardShadowBlur(parseInt(e.target.value))}
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-sm font-medium text-gray-300">Průhlednost stínu ({100 - cardShadowOpacity}%)</label>
                                                    </div>
                                                    <RangeSlider
                                                        min={0}
                                                        max={100}
                                                        step={5}
                                                        value={100 - cardShadowOpacity}
                                                        onChange={(e) => setCardShadowOpacity(100 - parseInt(e.target.value))}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CollapsibleSection>
                        </div >
                    </div >
                    <div className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur shrink-0">
                        <Toggle
                            checked={autoClose}
                            onChange={setAutoClose}
                            label="Zavírat neaktivní položky"
                        />
                    </div>
                </>
            )
            }
        </div >
    );
}
