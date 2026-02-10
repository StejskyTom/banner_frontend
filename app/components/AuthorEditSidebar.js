import { useState } from 'react';
import {
    UserIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { BoldIcon, ItalicIcon } from '@heroicons/react/24/outline';
import AuthorImageUpload from './AuthorImageUpload';
import RangeSlider from './RangeSlider';
import Toggle from './Toggle';
import ColorInput from './ColorInput';

// --- Reusable CollapsibleSection (same pattern as EditSidebar/HeurekaEditSidebar) ---
function CollapsibleSection({ title, children, isOpen, onToggle }) {
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
}

// --- StyleControls (same pattern as EditSidebar) ---
function StyleControls({ prefix, settings, onChange, defaultMargin = 0 }) {
    const handleChange = (key, value) => {
        onChange({ ...settings, [`${prefix}${key}`]: value });
    };

    const tag = settings[`${prefix}Tag`] || 'p';
    const align = settings[`${prefix}Align`] || 'center';
    const color = settings[`${prefix}Color`] || '#000000';
    const size = settings[`${prefix}Size`] || '16px';
    const font = settings[`${prefix}Font`] || 'sans-serif';
    const isBold = settings[`${prefix}Bold`] || false;
    const isItalic = settings[`${prefix}Italic`] || false;

    const ToolButton = ({ active, onClick, children, title }) => (
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

    return (
        <div className="space-y-3">
            {/* Buttons Row */}
            <div className="flex flex-wrap gap-1 items-center mb-3">
                <ToolButton onClick={() => handleChange('Tag', 'p')} active={tag === 'p'} title="Normal Text">T</ToolButton>
                <ToolButton onClick={() => handleChange('Tag', 'h1')} active={tag === 'h1'} title="H1">H1</ToolButton>
                <ToolButton onClick={() => handleChange('Tag', 'h2')} active={tag === 'h2'} title="H2">H2</ToolButton>
                <ToolButton onClick={() => handleChange('Tag', 'h3')} active={tag === 'h3'} title="H3">H3</ToolButton>

                <div className="w-px h-8 bg-gray-700 mx-1" />

                <ToolButton onClick={() => handleChange('Bold', !isBold)} active={isBold} title="Tučně">
                    <BoldIcon className="w-4 h-4" />
                </ToolButton>
                <ToolButton onClick={() => handleChange('Italic', !isItalic)} active={isItalic} title="Kurzíva">
                    <ItalicIcon className="w-4 h-4" />
                </ToolButton>
            </div>

            {/* Grid for Inputs */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="relative">
                    <ColorInput
                        value={color}
                        onChange={(val) => handleChange('Color', val)}
                    />
                </div>
                <select
                    className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4"
                    onChange={(e) => handleChange('Size', e.target.value)}
                    value={size}
                >
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                    <option value="32px">32px</option>
                    <option value="48px">48px</option>
                </select>

                <select
                    className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4"
                    onChange={(e) => handleChange('Font', e.target.value)}
                    value={font}
                >
                    <option value="sans-serif">Sans Serif</option>
                    <option value="system-ui">System UI</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Courier New, monospace">Courier</option>
                </select>
                <select
                    className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-visualy-accent-4"
                    onChange={(e) => handleChange('Align', e.target.value)}
                    value={align}
                >
                    <option value="left">Vlevo</option>
                    <option value="center">Na střed</option>
                    <option value="right">Vpravo</option>
                </select>
            </div>

            <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                    Spodní odsazení ({settings[`${prefix}MarginBottom`] ?? defaultMargin}px)
                </label>
                <RangeSlider
                    min={0}
                    max={100}
                    step={4}
                    value={settings[`${prefix}MarginBottom`] ?? defaultMargin}
                    onChange={(e) => handleChange('MarginBottom', parseInt(e.target.value))}
                />
            </div>
        </div>
    );
}

export default function AuthorEditSidebar({ widget, setWidget, activeTab }) {
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

    const handleUpdate = (field, value) => {
        setWidget(prev => ({ ...prev, [field]: value }));
    };

    const updateSettings = (newSettings) => {
        setWidget(prev => ({ ...prev, settings: newSettings }));
    };

    const settings = widget.settings || {};

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
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 placeholder-gray-500"
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
                                    className="mt-1 w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 placeholder-gray-500"
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
                                    className="pl-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 placeholder-gray-500"
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
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 placeholder-gray-500"
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
                                className="min-h-[80px] w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'settings') {
        return (
            <div className="dark w-80 bg-gray-900 border-r border-gray-800 text-white flex flex-col h-full">
                <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                    <div>
                        {/* Name Style */}
                        <CollapsibleSection title="Jméno" isOpen={!!openSections['name-style']} onToggle={() => toggleSection('name-style')}>
                            <StyleControls
                                prefix="name"
                                settings={settings}
                                onChange={updateSettings}
                                defaultMargin={8}
                            />
                        </CollapsibleSection>

                        <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                        {/* Position/Title Style */}
                        <CollapsibleSection title="Pozice" isOpen={!!openSections['position-style']} onToggle={() => toggleSection('position-style')}>
                            <StyleControls
                                prefix="position"
                                settings={settings}
                                onChange={updateSettings}
                                defaultMargin={20}
                            />
                        </CollapsibleSection>

                        <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                        {/* Bio Style */}
                        <CollapsibleSection title="Bio" isOpen={!!openSections['bio-style']} onToggle={() => toggleSection('bio-style')}>
                            <StyleControls
                                prefix="bio"
                                settings={settings}
                                onChange={updateSettings}
                                defaultMargin={0}
                            />
                        </CollapsibleSection>

                        <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                        {/* Photo Style */}
                        <CollapsibleSection title="Fotografie" isOpen={!!openSections['photo-style']} onToggle={() => toggleSection('photo-style')}>
                            <div className="space-y-4">
                                {/* Photo Size */}
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-2 block">
                                        Velikost ({settings.photoSize ?? 128}px)
                                    </label>
                                    <RangeSlider
                                        min={64}
                                        max={200}
                                        step={4}
                                        value={settings.photoSize ?? 128}
                                        onChange={(e) => updateSettings({ ...settings, photoSize: parseInt(e.target.value) })}
                                    />
                                </div>

                                {/* Border Radius */}
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-2 block">
                                        Zakulacení ({settings.photoRadius ?? 50}%)
                                    </label>
                                    <RangeSlider
                                        min={0}
                                        max={50}
                                        step={1}
                                        value={settings.photoRadius ?? 50}
                                        onChange={(e) => updateSettings({ ...settings, photoRadius: parseInt(e.target.value) })}
                                    />
                                </div>

                                {/* Border Width */}
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-2 block">
                                        Rámeček ({settings.photoBorderWidth ?? 4}px)
                                    </label>
                                    <RangeSlider
                                        min={0}
                                        max={8}
                                        step={1}
                                        value={settings.photoBorderWidth ?? 4}
                                        onChange={(e) => updateSettings({ ...settings, photoBorderWidth: parseInt(e.target.value) })}
                                    />
                                </div>

                                {/* Border Color */}
                                <ColorInput
                                    label="Barva rámečku"
                                    value={settings.photoBorderColor || '#f3f4f6'}
                                    onChange={(val) => updateSettings({ ...settings, photoBorderColor: val })}
                                />

                                {/* Shadow */}
                                <Toggle
                                    checked={settings.photoShadow || false}
                                    onChange={(val) => updateSettings({ ...settings, photoShadow: val })}
                                    label="Stín pod fotografií"
                                />

                                {settings.photoShadow && (
                                    <>
                                        <div>
                                            <label className="text-xs font-medium text-gray-400 mb-2 block">
                                                Rozmazání stínu ({settings.photoShadowBlur ?? 12}px)
                                            </label>
                                            <RangeSlider
                                                min={0}
                                                max={50}
                                                step={1}
                                                value={settings.photoShadowBlur ?? 12}
                                                onChange={(e) => updateSettings({ ...settings, photoShadowBlur: parseInt(e.target.value) })}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-medium text-gray-400 mb-2 block">
                                                Průhlednost stínu ({settings.photoShadowOpacity ?? 25}%)
                                            </label>
                                            <RangeSlider
                                                min={0}
                                                max={100}
                                                step={5}
                                                value={settings.photoShadowOpacity ?? 25}
                                                onChange={(e) => updateSettings({ ...settings, photoShadowOpacity: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Bottom Margin */}
                                <div>
                                    <label className="text-xs font-medium text-gray-400 mb-2 block">
                                        Spodní odsazení ({settings.photoMarginBottom ?? 20}px)
                                    </label>
                                    <RangeSlider
                                        min={0}
                                        max={60}
                                        step={4}
                                        value={settings.photoMarginBottom ?? 20}
                                        onChange={(e) => updateSettings({ ...settings, photoMarginBottom: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>

                        <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                        {/* Border Settings */}
                        <CollapsibleSection title="Nastavení rámečku" isOpen={!!openSections['border']} onToggle={() => toggleSection('border')}>
                            <div className="space-y-4">
                                <Toggle
                                    checked={settings.borderEnabled || false}
                                    onChange={(val) => updateSettings({ ...settings, borderEnabled: val })}
                                    label="Zobrazit rámeček"
                                />

                                {settings.borderEnabled && (
                                    <>
                                        <ColorInput
                                            label="Barva rámečku"
                                            value={settings.borderColor || '#e5e7eb'}
                                            onChange={(val) => updateSettings({ ...settings, borderColor: val })}
                                        />
                                        <div>
                                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                                                Šířka rámečku ({settings.borderWidth ?? 1}px)
                                            </label>
                                            <RangeSlider
                                                min={1}
                                                max={10}
                                                step={1}
                                                value={settings.borderWidth ?? 1}
                                                onChange={(e) => updateSettings({ ...settings, borderWidth: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                                                Zaoblení rámečku ({widget.borderRadius || 0}px)
                                            </label>
                                            <RangeSlider
                                                value={widget.borderRadius || 0}
                                                onChange={(e) => handleUpdate('borderRadius', parseInt(e.target.value))}
                                                min={0}
                                                max={50}
                                                step={1}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </CollapsibleSection>

                        <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                        {/* Other Settings */}
                        <CollapsibleSection title="Další nastavení" isOpen={!!openSections['other']} onToggle={() => toggleSection('other')}>
                            <div className="space-y-4">
                                {/* Layout */}
                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-gray-400">Rozložení</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleUpdate('layout', 'centered')}
                                            className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition ${widget.layout === 'centered'
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
                                            onClick={() => handleUpdate('layout', 'side-by-side')}
                                            className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition ${widget.layout === 'side-by-side'
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




                                <hr className="border-0 h-px bg-gray-700/50" />

                                {/* Background Color */}
                                <ColorInput
                                    label="Barva pozadí"
                                    value={widget.backgroundColor || '#ffffff'}
                                    onChange={(val) => handleUpdate('backgroundColor', val)}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
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
