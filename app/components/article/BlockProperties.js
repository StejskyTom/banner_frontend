'use client';

import { useState, useEffect } from 'react';
import { authorizedFetch } from '../../../lib/api';
import { RangeControl, Input, TextArea, Select } from './Helpers';
import ImageUpload from './ImageUpload';
import RichTextToolbar from './RichTextToolbar';
import Toggle from '../Toggle';
import { SwatchIcon, TrashIcon, PlusIcon, BoldIcon, ItalicIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const Separator = () => (
    <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />
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

const ToolButton = ({ active, children, onClick, title }) => (
    <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={`p-2 rounded-md transition-all font-medium text-sm border flex items-center justify-center h-8 min-w-[32px] flex-1
            ${active
                ? 'bg-visualy-accent-4/20 text-visualy-accent-4 border-visualy-accent-4/50'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 hover:border-gray-600'
            }`}
        title={title}
    >
        {children}
    </button>
);

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
    italic, setItalic,
    align, setAlign,
    tag, setTag, // New props for heading tags
    marginTop, setMarginTop,
    marginBottom, setMarginBottom
}) => {
    return (
        <div className="space-y-3">
            {/* Buttons Row with Tags */}
            <div className="flex flex-wrap gap-1 items-center mb-3">
                {setTag && (
                    <>
                        <ToolButton onClick={() => setTag('p')} active={tag === 'p'} title="Normal Text">T</ToolButton>
                        <ToolButton onClick={() => setTag('h1')} active={tag === 'h1'} title="H1">H1</ToolButton>
                        <ToolButton onClick={() => setTag('h2')} active={tag === 'h2'} title="H2">H2</ToolButton>
                        <ToolButton onClick={() => setTag('h3')} active={tag === 'h3'} title="H3">H3</ToolButton>
                        <div className="w-px h-8 bg-gray-700 mx-1" />
                    </>
                )}

                <ToolButton onClick={() => setBold(!bold)} active={bold} title="Tučně">
                    <BoldIcon className="w-4 h-4" />
                </ToolButton>
                <ToolButton onClick={() => setItalic(!italic)} active={italic} title="Kurzíva">
                    <ItalicIcon className="w-4 h-4" />
                </ToolButton>
            </div>

            {/* Grid for Inputs - matching Order and sizing from EditSidebar */}
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
                    <option value="32px">32px</option>
                    <option value="48px">48px</option>
                </select>

                <select
                    className="h-10 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4"
                    onChange={(e) => setFont(e.target.value)}
                    value={font}
                >
                    <option value="sans-serif">Sans Serif</option>
                    <option value="system-ui">System UI</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Courier New, monospace">Courier</option>
                </select>

                {setAlign && (
                    <select
                        className="h-10 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4"
                        onChange={(e) => setAlign(e.target.value)}
                        value={align}
                    >
                        <option value="left">Vlevo</option>
                        <option value="center">Na střed</option>
                        <option value="right">Vpravo</option>
                    </select>
                )}
            </div>

            {setMarginTop && (
                <RangeControl
                    label="Horní odsazení"
                    value={marginTop ?? 0}
                    onChange={setMarginTop}
                    min={0}
                    max={100}
                    step={4}
                    unit="px"
                />
            )}

            {setMarginBottom && (
                <RangeControl
                    label="Spodní odsazení"
                    value={marginBottom ?? 0}
                    onChange={setMarginBottom}
                    min={0}
                    max={100}
                    step={4}
                    unit="px"
                />
            )}
        </div>
    );
};

export function TextProperties({ block, onChange, activeFormats = {} }) {
    return (
        <>
            <RichTextToolbar
                activeFormats={activeFormats}
                alignment={block.align || 'left'}
                onAlignmentChange={(val) => onChange({ ...block, align: val })}
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

export function ProductProperties({ block, onChange, widgetId, tab = 'content' }) {
    const [mode, setMode] = useState('manual'); // 'manual' | 'search'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

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

    if (tab === 'content') {
        return (
            <>
                <CollapsibleSection title="Obsah" isOpen={true} onToggle={() => { }}>
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
                                                    <div className="text-xs text-visualy-accent-4 font-bold">{product.priceVat} Kč</div>
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
                            <Input
                                label="Cena"
                                value={block.price}
                                onChange={(val) => onChange({ ...block, price: val })}
                                placeholder="např. 199 Kč"
                            />
                            <Input
                                label="Odkaz na produkt"
                                value={block.link}
                                onChange={(val) => onChange({ ...block, link: val })}
                                placeholder="https://..."
                            />
                            <ImageUpload
                                url={block.imgUrl}
                                onChange={(url) => onChange({ ...block, imgUrl: url })}
                                widgetId={widgetId}
                            />
                        </>
                    )}
                </CollapsibleSection>
            </>
        );
    }

    if (tab === 'settings') {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-0 custom-scrollbar">
                    <CollapsibleSection title="Nastavení obrázku" isOpen={!!openSections['image']} onToggle={() => toggleSection('image')}>
                        <div className="space-y-4">
                            <RangeControl
                                label="Výška obrázku"
                                value={block.imageHeight || 160}
                                onChange={(val) => onChange({ ...block, imageHeight: val })}
                                min={100} max={400} unit="px"
                            />
                            <Select
                                label="Přizpůsobení"
                                value={block.imageObjectFit || 'cover'}
                                onChange={(val) => onChange({ ...block, imageObjectFit: val })}
                                options={[
                                    { value: 'contain', label: 'Zobrazit celý (Contain)' },
                                    { value: 'cover', label: 'Vyplnit (Cover)' },
                                    { value: 'fill', label: 'Roztáhnout (Fill)' }
                                ]}
                            />
                            <RangeControl
                                label="Vnitřní odsazení"
                                value={block.imagePadding !== undefined ? block.imagePadding : 8}
                                onChange={(val) => onChange({ ...block, imagePadding: val })}
                                min={0} max={32} unit="px"
                            />
                            <RangeControl
                                label="Spodní odsazení"
                                value={block.imageMarginBottom || 16}
                                onChange={(val) => onChange({ ...block, imageMarginBottom: val })}
                                min={0} max={64} unit="px"
                            />
                            <RangeControl
                                label="Zaoblení rohů"
                                value={block.imageBorderRadius !== undefined ? block.imageBorderRadius : 8}
                                onChange={(val) => onChange({ ...block, imageBorderRadius: val })}
                                min={0} max={32} unit="px"
                            />
                        </div>
                    </CollapsibleSection>

                    <Separator />

                    <CollapsibleSection title="Název produktu" isOpen={!!openSections['product-name']} onToggle={() => toggleSection('product-name')}>
                        <TypographyControls
                            color={block.productNameColor || '#111827'}
                            setColor={(val) => onChange({ ...block, productNameColor: val })}
                            size={block.productNameSize || '16px'}
                            setSize={(val) => onChange({ ...block, productNameSize: val })}
                            font={block.productNameFont}
                            setFont={(val) => onChange({ ...block, productNameFont: val })}
                            bold={block.productNameBold}
                            setBold={(val) => onChange({ ...block, productNameBold: val })}
                            italic={block.productNameItalic}
                            setItalic={(val) => onChange({ ...block, productNameItalic: val })}
                            align={block.productNameAlign}
                            setAlign={(val) => onChange({ ...block, productNameAlign: val })}
                            tag={block.productNameTag || 'h3'}
                            setTag={(val) => onChange({ ...block, productNameTag: val })}
                            marginTop={block.productNameMarginTop}
                            setMarginTop={(val) => onChange({ ...block, productNameMarginTop: val })}
                            marginBottom={block.productNameMarginBottom !== undefined ? block.productNameMarginBottom : 12}
                            setMarginBottom={(val) => onChange({ ...block, productNameMarginBottom: val })}
                        />
                        <div className="pt-2 border-t border-gray-800 space-y-4">
                            <Toggle checked={block.productNameFull} onChange={(val) => onChange({ ...block, productNameFull: val })} label="Zobrazit celý název" />
                        </div>
                    </CollapsibleSection>

                    <Separator />

                    <CollapsibleSection title="Popis produktu" isOpen={!!openSections['description']} onToggle={() => toggleSection('description')}>
                        <div className="space-y-4">
                            <Toggle checked={block.descriptionEnabled !== false} onChange={(val) => onChange({ ...block, descriptionEnabled: val })} label="Zobrazit popis" />
                            {block.descriptionEnabled !== false && (
                                <>
                                    <TypographyControls
                                        color={block.descriptionColor || '#4b5563'}
                                        setColor={(val) => onChange({ ...block, descriptionColor: val })}
                                        size={block.descriptionSize || '14px'}
                                        setSize={(val) => onChange({ ...block, descriptionSize: val })}
                                        font={block.descriptionFont}
                                        setFont={(val) => onChange({ ...block, descriptionFont: val })}
                                        bold={block.descriptionBold}
                                        setBold={(val) => onChange({ ...block, descriptionBold: val })}
                                        italic={block.descriptionItalic}
                                        setItalic={(val) => onChange({ ...block, descriptionItalic: val })}
                                        align={block.descriptionAlign}
                                        setAlign={(val) => onChange({ ...block, descriptionAlign: val })}
                                        marginTop={block.descriptionMarginTop}
                                        setMarginTop={(val) => onChange({ ...block, descriptionMarginTop: val })}
                                        marginBottom={block.descriptionMarginBottom !== undefined ? block.descriptionMarginBottom : 16}
                                        setMarginBottom={(val) => onChange({ ...block, descriptionMarginBottom: val })}
                                    />
                                    <div className="pt-2 border-t border-gray-800 space-y-4">
                                        <RangeControl
                                            label="Zkrátit popis (znaky)"
                                            value={block.descriptionTruncateLength || 100}
                                            onChange={(val) => onChange({ ...block, descriptionTruncateLength: val })}
                                            min={10} max={500} step={5}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </CollapsibleSection>

                    <Separator />

                    <CollapsibleSection title="Cena produktu" isOpen={!!openSections['price']} onToggle={() => toggleSection('price')}>
                        <TypographyControls
                            color={block.priceColor || '#059669'}
                            setColor={(val) => onChange({ ...block, priceColor: val })}
                            size={block.priceSize || '20px'}
                            setSize={(val) => onChange({ ...block, priceSize: val })}
                            font={block.priceFont}
                            setFont={(val) => onChange({ ...block, priceFont: val })}
                            bold={block.priceBold}
                            setBold={(val) => onChange({ ...block, priceBold: val })}
                            italic={block.priceItalic}
                            setItalic={(val) => onChange({ ...block, priceItalic: val })}
                            align={block.priceAlign}
                            setAlign={(val) => onChange({ ...block, priceAlign: val })}
                            marginTop={block.priceMarginTop}
                            setMarginTop={(val) => onChange({ ...block, priceMarginTop: val })}
                            marginBottom={block.priceMarginBottom !== undefined ? block.priceMarginBottom : 16}
                            setMarginBottom={(val) => onChange({ ...block, priceMarginBottom: val })}
                        />
                    </CollapsibleSection>

                    <Separator />

                    <CollapsibleSection title="Tlačítko" isOpen={!!openSections['button']} onToggle={() => toggleSection('button')}>
                        <Input
                            label="Text tlačítka"
                            value={block.btnText || 'Koupit'}
                            onChange={(val) => onChange({ ...block, btnText: val })}
                            placeholder="Koupit"
                        />
                        <TypographyControls
                            color={block.btnTextColor || '#ffffff'}
                            setColor={(val) => onChange({ ...block, btnTextColor: val })}
                            size={block.btnFontSize || '14px'}
                            setSize={(val) => onChange({ ...block, btnFontSize: val })}
                            font={block.btnFont}
                            setFont={(val) => onChange({ ...block, btnFont: val })}
                            bold={block.btnBold}
                            setBold={(val) => onChange({ ...block, btnBold: val })}
                            italic={block.btnItalic}
                            setItalic={(val) => onChange({ ...block, btnItalic: val })}
                        />
                        <div className="pt-2 border-t border-gray-800 space-y-4">
                            <ColorInput
                                label="Barva tlačítka"
                                value={block.btnColor || '#26AD80'}
                                onChange={(val) => onChange({ ...block, btnColor: val })}
                            />
                            <RangeControl
                                label="Zaoblení tlačítka"
                                value={block.btnBorderRadius !== undefined ? block.btnBorderRadius : 8}
                                onChange={(val) => onChange({ ...block, btnBorderRadius: val })}
                                min={0} max={32} unit="px"
                            />
                            <RangeControl
                                label="Horní odsazení"
                                value={block.buttonMarginTop || 8}
                                onChange={(val) => onChange({ ...block, buttonMarginTop: val })}
                                min={0} max={64} unit="px"
                            />
                            <RangeControl
                                label="Spodní odsazení"
                                value={block.buttonMarginBottom || 0}
                                onChange={(val) => onChange({ ...block, buttonMarginBottom: val })}
                                min={0} max={64} unit="px"
                            />
                        </div>
                    </CollapsibleSection>

                    <Separator />

                    <CollapsibleSection title="Karta produktu" isOpen={!!openSections['card']} onToggle={() => toggleSection('card')}>
                        <div className="space-y-4">
                            <Toggle checked={block.cardBorderEnabled} onChange={(val) => onChange({ ...block, cardBorderEnabled: val })} label="Zobrazit rámeček" />
                            {block.cardBorderEnabled && (
                                <>
                                    <ColorInput
                                        label="Barva rámečku"
                                        value={block.cardBorderColor || '#e5e7eb'}
                                        onChange={(val) => onChange({ ...block, cardBorderColor: val })}
                                    />
                                    <RangeControl
                                        label="Šířka rámečku"
                                        value={block.cardBorderWidth || 1}
                                        onChange={(val) => onChange({ ...block, cardBorderWidth: val })}
                                        min={1} max={10} unit="px"
                                    />
                                </>
                            )}
                            <ColorInput
                                label="Barva pozadí karty"
                                value={block.cardBackgroundColor || '#ffffff'}
                                onChange={(val) => onChange({ ...block, cardBackgroundColor: val })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <RangeControl
                                    label="Padding X"
                                    value={block.cardPaddingX !== undefined ? block.cardPaddingX : 20}
                                    onChange={(val) => onChange({ ...block, cardPaddingX: val })}
                                    min={0} max={64} step={4} unit="px"
                                />
                                <RangeControl
                                    label="Padding Y"
                                    value={block.cardPaddingY !== undefined ? block.cardPaddingY : 20}
                                    onChange={(val) => onChange({ ...block, cardPaddingY: val })}
                                    min={0} max={64} step={4} unit="px"
                                />
                            </div>
                            <RangeControl
                                label="Zaoblení karty"
                                value={block.cardBorderRadius !== undefined ? block.cardBorderRadius : 12}
                                onChange={(val) => onChange({ ...block, cardBorderRadius: val })}
                                min={0} max={32} unit="px"
                            />

                            <Toggle checked={block.cardShadowEnabled} onChange={(val) => onChange({ ...block, cardShadowEnabled: val })} label="Stín pod kartou" />
                            {block.cardShadowEnabled && (
                                <div className="space-y-4">
                                    <ColorInput
                                        label="Barva stínu"
                                        value={block.cardShadowColor || '#000000'}
                                        onChange={(val) => onChange({ ...block, cardShadowColor: val })}
                                    />
                                    <RangeControl
                                        label="Rozmazání (Blur)"
                                        value={block.cardShadowBlur !== undefined ? block.cardShadowBlur : 10}
                                        onChange={(val) => onChange({ ...block, cardShadowBlur: val })}
                                        min={0} max={50} unit="px"
                                    />
                                    <RangeControl
                                        label="Průhlednost (%)"
                                        value={block.cardShadowOpacity || 10}
                                        onChange={(val) => onChange({ ...block, cardShadowOpacity: val })}
                                        min={0} max={100}
                                    />
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>
                </div>
                <div className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur shrink-0">
                    <Toggle
                        checked={autoClose}
                        onChange={setAutoClose}
                        label="Zavírat neaktivní položky"
                    />
                </div>
            </div>
        );
    }

    return null;
}


const LAYOUT_PRESETS = [
    { label: '100', columns: [100], span: 2 },
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
                                className={`group relative p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-800 hover:border-gray-600 transition-all text-left ${preset.span === 2 ? 'col-span-2' : ''}`}
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

export function AuthorProperties({ block, onChange, widgetId, tab = 'content' }) {
    // --- Shared State for Settings ---
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

    // --- Content Tab State ---
    const [mode, setMode] = useState('manual'); // 'manual' | 'select'
    const [authors, setAuthors] = useState([]);
    const [selectedAuthorId, setSelectedAuthorId] = useState('');

    useEffect(() => {
        if (tab === 'content' && mode === 'select' && authors.length === 0) {
            authorizedFetch('/author-widgets')
                .then(res => res.json())
                .then(data => {
                    setAuthors(data);
                })
                .catch(err => console.error('Error fetching authors:', err));
        }
    }, [mode, authors.length, tab]);

    const selectAuthor = (author) => {
        onChange({
            ...block,
            name: author.authorName,
            title: author.authorTitle,
            bio: author.authorBio,
            photoUrl: author.authorPhotoUrl,
            // Import styles as well
            layout: author.layout || 'centered',
            backgroundColor: author.backgroundColor,
            // Name styles
            authorNameColor: author.authorNameColor,
            authorNameSize: author.authorNameSize,
            authorNameFont: author.authorNameFont,
            authorNameBold: author.authorNameBold,
            authorNameItalic: author.authorNameItalic,
            authorNameTag: author.authorNameTag,
            authorNameAlign: author.authorNameAlign,
            authorNameMarginBottom: author.authorNameMarginBottom,
            // Title styles
            authorTitleColor: author.authorTitleColor,
            authorTitleSize: author.authorTitleSize,
            authorTitleFont: author.authorTitleFont,
            authorTitleBold: author.authorTitleBold,
            authorTitleItalic: author.authorTitleItalic,
            authorTitleTag: author.authorTitleTag,
            authorTitleAlign: author.authorTitleAlign,
            authorTitleMarginBottom: author.authorTitleMarginBottom,
            // Bio styles
            authorBioColor: author.authorBioColor,
            authorBioSize: author.authorBioSize,
            authorBioFont: author.authorBioFont,
            authorBioBold: author.authorBioBold,
            authorBioItalic: author.authorBioItalic,
            authorBioTag: author.authorBioTag,
            authorBioAlign: author.authorBioAlign,
            authorBioMarginBottom: author.authorBioMarginBottom,
            // Photo styles
            photoRadius: author.photoRadius,
            photoShadow: author.photoShadow,
            photoShadowBlur: author.photoShadowBlur,
            photoShadowOpacity: author.photoShadowOpacity,
            photoMarginBottom: author.photoMarginBottom,
            // Border styles
            borderEnabled: author.borderEnabled,
            borderColor: author.borderColor,
            borderWidth: author.borderWidth,
            borderRadius: author.borderRadius,
        });
        setSelectedAuthorId(author.id);
    };

    if (tab === 'settings') {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-0 custom-scrollbar">

                    {/* Jméno autora */}
                    <CollapsibleSection title="Jméno autora" isOpen={!!openSections['name']} onToggle={() => toggleSection('name')}>
                        <TypographyControls
                            color={block.authorNameColor || '#111827'}
                            setColor={(val) => onChange({ ...block, authorNameColor: val })}
                            size={block.authorNameSize || '20px'}
                            setSize={(val) => onChange({ ...block, authorNameSize: val })}
                            font={block.authorNameFont}
                            setFont={(val) => onChange({ ...block, authorNameFont: val })}
                            bold={block.authorNameBold !== false}
                            setBold={(val) => onChange({ ...block, authorNameBold: val })}
                            italic={block.authorNameItalic}
                            setItalic={(val) => onChange({ ...block, authorNameItalic: val })}
                            align={block.authorNameAlign || 'center'}
                            setAlign={(val) => onChange({ ...block, authorNameAlign: val })}
                            tag={block.authorNameTag || 'h3'}
                            setTag={(val) => onChange({ ...block, authorNameTag: val })}
                            marginBottom={block.authorNameMarginBottom !== undefined ? block.authorNameMarginBottom : 4}
                            setMarginBottom={(val) => onChange({ ...block, authorNameMarginBottom: val })}
                        />
                    </CollapsibleSection>

                    <Separator />

                    {/* Titul / Pozice */}
                    <CollapsibleSection title="Titul / Pozice" isOpen={!!openSections['title']} onToggle={() => toggleSection('title')}>
                        <TypographyControls
                            color={block.authorTitleColor || '#26AD80'}
                            setColor={(val) => onChange({ ...block, authorTitleColor: val })}
                            size={block.authorTitleSize || '14px'}
                            setSize={(val) => onChange({ ...block, authorTitleSize: val })}
                            font={block.authorTitleFont}
                            setFont={(val) => onChange({ ...block, authorTitleFont: val })}
                            bold={block.authorTitleBold !== false}
                            setBold={(val) => onChange({ ...block, authorTitleBold: val })}
                            italic={block.authorTitleItalic}
                            setItalic={(val) => onChange({ ...block, authorTitleItalic: val })}
                            align={block.authorTitleAlign || 'center'}
                            setAlign={(val) => onChange({ ...block, authorTitleAlign: val })}
                            tag={block.authorTitleTag || 'p'}
                            setTag={(val) => onChange({ ...block, authorTitleTag: val })}
                            marginBottom={block.authorTitleMarginBottom !== undefined ? block.authorTitleMarginBottom : 12}
                            setMarginBottom={(val) => onChange({ ...block, authorTitleMarginBottom: val })}
                        />
                    </CollapsibleSection>

                    <Separator />

                    {/* Bio */}
                    <CollapsibleSection title="Bio" isOpen={!!openSections['bio']} onToggle={() => toggleSection('bio')}>
                        <TypographyControls
                            color={block.authorBioColor || '#4b5563'}
                            setColor={(val) => onChange({ ...block, authorBioColor: val })}
                            size={block.authorBioSize || '14px'}
                            setSize={(val) => onChange({ ...block, authorBioSize: val })}
                            font={block.authorBioFont}
                            setFont={(val) => onChange({ ...block, authorBioFont: val })}
                            bold={block.authorBioBold}
                            setBold={(val) => onChange({ ...block, authorBioBold: val })}
                            italic={block.authorBioItalic}
                            setItalic={(val) => onChange({ ...block, authorBioItalic: val })}
                            align={block.authorBioAlign || 'center'}
                            setAlign={(val) => onChange({ ...block, authorBioAlign: val })}
                            tag={block.authorBioTag || 'p'}
                            setTag={(val) => onChange({ ...block, authorBioTag: val })}
                            marginBottom={block.authorBioMarginBottom !== undefined ? block.authorBioMarginBottom : 16}
                            setMarginBottom={(val) => onChange({ ...block, authorBioMarginBottom: val })}
                        />
                    </CollapsibleSection>

                    <Separator />

                    {/* Fotografie */}
                    <CollapsibleSection title="Fotografie" isOpen={!!openSections['photo']} onToggle={() => toggleSection('photo')}>
                        <div className="space-y-4">
                            <RangeControl
                                label="Zaoblení fotky"
                                value={block.photoRadius !== undefined ? block.photoRadius : 50}
                                onChange={(val) => onChange({ ...block, photoRadius: val })}
                                min={0} max={50} unit="%"
                            />
                            <Toggle checked={block.photoShadow} onChange={(val) => onChange({ ...block, photoShadow: val })} label="Stín pod fotkou" />
                            {block.photoShadow && (
                                <>
                                    <RangeControl
                                        label="Rozmazání stínu"
                                        value={block.photoShadowBlur !== undefined ? block.photoShadowBlur : 12}
                                        onChange={(val) => onChange({ ...block, photoShadowBlur: val })}
                                        min={0} max={50} unit="px"
                                    />
                                    <RangeControl
                                        label="Průhlednost stínu (%)"
                                        value={block.photoShadowOpacity !== undefined ? block.photoShadowOpacity : 25}
                                        onChange={(val) => onChange({ ...block, photoShadowOpacity: val })}
                                        min={0} max={100}
                                    />
                                </>
                            )}
                            <RangeControl
                                label="Spodní odsazení"
                                value={block.photoMarginBottom !== undefined ? block.photoMarginBottom : 20}
                                onChange={(val) => onChange({ ...block, photoMarginBottom: val })}
                                min={0} max={64} unit="px"
                            />
                        </div>
                    </CollapsibleSection>

                    <Separator />

                    {/* Rámeček */}
                    <CollapsibleSection title="Nastavení rámečku" isOpen={!!openSections['border']} onToggle={() => toggleSection('border')}>
                        <div className="space-y-4">
                            <Toggle checked={block.borderEnabled} onChange={(val) => onChange({ ...block, borderEnabled: val })} label="Zobrazit rámeček" />
                            {block.borderEnabled && (
                                <>
                                    <ColorInput
                                        label="Barva rámečku"
                                        value={block.borderColor || '#e5e7eb'}
                                        onChange={(val) => onChange({ ...block, borderColor: val })}
                                    />
                                    <RangeControl
                                        label="Šířka rámečku"
                                        value={block.borderWidth !== undefined ? block.borderWidth : 1}
                                        onChange={(val) => onChange({ ...block, borderWidth: val })}
                                        min={1} max={10} unit="px"
                                    />
                                    <RangeControl
                                        label="Zaoblení rámečku"
                                        value={block.borderRadius !== undefined ? block.borderRadius : 0}
                                        onChange={(val) => onChange({ ...block, borderRadius: val })}
                                        min={0} max={50} unit="px"
                                    />
                                </>
                            )}
                        </div>
                    </CollapsibleSection>

                    <Separator />

                    {/* Další nastavení */}
                    <CollapsibleSection title="Další nastavení" isOpen={!!openSections['other']} onToggle={() => toggleSection('other')}>
                        <div className="space-y-4">
                            {/* Layout Selection */}
                            <div className="space-y-3">
                                <label className="text-xs font-medium text-gray-400">Rozložení</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => onChange({ ...block, layout: 'centered' })}
                                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition ${block.layout === 'centered'
                                            ? 'border-visualy-accent-4/50 bg-visualy-accent-4/10 text-visualy-accent-4'
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
                                        onClick={() => onChange({ ...block, layout: 'side-by-side' })}
                                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition ${block.layout === 'side-by-side'
                                            ? 'border-visualy-accent-4/50 bg-visualy-accent-4/10 text-visualy-accent-4'
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

                            <div className="h-px bg-gray-800" />

                            <ColorInput
                                label="Barva pozadí"
                                value={block.backgroundColor || '#ffffff'}
                                onChange={(val) => onChange({ ...block, backgroundColor: val })}
                            />
                        </div>
                    </CollapsibleSection>

                </div>
                <div className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur shrink-0">
                    <Toggle
                        checked={autoClose}
                        onChange={setAutoClose}
                        label="Zavírat neaktivní položky"
                    />
                </div>
            </div>
        );
    }

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
