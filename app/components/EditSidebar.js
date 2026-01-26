'use client';

import { useState, useRef } from 'react';
import { Upload } from "lucide-react";
import UploadAttachment from "../../app/components/UploadAttachment";
import { useToast } from "../../app/components/ToastProvider";
import { authorizedFetch } from "../../lib/api";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  MouseSensor, TouchSensor, KeyboardSensor, DragOverlay
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RangeSlider from './RangeSlider';
import Toggle from './Toggle';
import { Select, TextArea } from './article/Helpers';
import { Dropdown } from './Dropdown';
import ColorInput from './ColorInput';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { TrashIcon, BoldIcon, ItalicIcon } from '@heroicons/react/24/outline'; // Outline icons for buttons

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      {icon}
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    </div>
  );
}

// Helper component for style controls
function StyleControls({ prefix, settings, onChange, defaultMargin = 0 }) {
  const handleChange = (key, value) => {
    onChange({ ...settings, [`${prefix}${key}`]: value });
  };

  const tag = settings[`${prefix}Tag`] || 'h2';
  const align = settings[`${prefix}Align`] || 'center';
  const color = settings[`${prefix}Color`] || '#000000';
  const size = settings[`${prefix}Size`] || '24px';
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
          ? 'bg-green-500/20 text-green-400 border-green-500/50'
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
          className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
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
          className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
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
          className="h-9 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
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

function LogoItemEditor({ id, item, alt, onRemove, onLinkChange, onAltChange, onReplace }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', position: 'relative' };
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) onReplace(id, e.target.files[0]);
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-gray-800 rounded border transition-colors ${isOpen ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-gray-700 hover:border-gray-600'}`}>
      {/* Header */}
      <div className="flex items-center p-2 gap-3 group">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-500 hover:text-gray-300 p-1 rounded hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <div className="w-10 h-10 rounded bg-gray-900 border border-gray-700 flex-shrink-0 p-1 flex items-center justify-center">
          <img src={item.url} className="max-w-full max-h-full object-contain" alt="" />
        </div>

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="text-xs font-medium text-white truncate">
            {alt || <span className="text-gray-500 italic">Bez popisku</span>}
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            {item.link || 'Bez odkazu'}
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="px-3 pb-3 pt-0 space-y-3">
          <hr className="border-gray-700 mb-3" />

          <div className="flex gap-4">
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 block">Odkaz (URL)</label>
                <input
                  type="url"
                  value={item.link || ''}
                  onChange={(e) => onLinkChange(e.target.value)}
                  placeholder="https://"
                  className="w-full text-xs px-2 py-1.5 bg-gray-900 border border-gray-700 text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 block">Alt Popisek</label>
                <input
                  type="text"
                  value={alt || ''}
                  onChange={(e) => onAltChange(e.target.value)}
                  placeholder="Popis obrázku..."
                  className="w-full text-xs px-2 py-1.5 bg-gray-900 border border-gray-700 text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-500 placeholder-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Nahrát
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                hidden
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
              />
            </div>

            <button
              onClick={onRemove}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2 py-1.5 rounded transition-colors flex items-center gap-1"
            >
              <TrashIcon className="w-3 h-3" /> Odstranit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="group">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer list-none text-xs font-bold text-gray-500 uppercase px-1 py-2 select-none leading-none tracking-wider"
      >
        <span className="translate-y-[1px]">{title}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden px-1 pb-1">
          <div className="space-y-4 mt-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditSidebar({ carousel, setCarousel, activeTab }) {
  const showNotification = useToast();

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
    useSensor(PointerSensor, { activationConstraint: { distance: 0.01 } })
  );

  const handleAltChange = (attachmentId, newAlt) => {
    const currentAlts = carousel.settings?.attachmentAlts || {};
    updateSettings({
      ...carousel.settings,
      attachmentAlts: { ...currentAlts, [attachmentId]: newAlt }
    });
  };

  const handleReplaceImage = async (attachmentId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authorizedFetch(`/widgets/${carousel.id}/attachments`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const newAttachment = await res.json();
        const index = carousel.attachments.findIndex(a => a.id === attachmentId);
        if (index === -1) return;

        const oldItem = carousel.attachments[index];
        const oldAlt = carousel.settings?.attachmentAlts?.[attachmentId];

        // Create updated item preserving metadata
        const updatedItem = { ...newAttachment, link: oldItem.link };

        const newAttachments = [...carousel.attachments];
        newAttachments[index] = updatedItem;

        const newSettings = { ...(carousel.settings || {}) };
        const newAlts = { ...(newSettings.attachmentAlts || {}) };

        if (oldAlt) {
          newAlts[newAttachment.id] = oldAlt;
        }
        // Clean up old alt
        delete newAlts[attachmentId];
        newSettings.attachmentAlts = newAlts;

        setCarousel({ ...carousel, attachments: newAttachments, settings: newSettings });

        // Cleanup old file
        await authorizedFetch(`/attachments/${attachmentId}`, { method: 'DELETE' });

        showNotification("Obrázek nahrazen", "success");
      } else {
        const err = await res.json();
        showNotification(err.error || "Chyba nahrávání", "error");
      }
    } catch (e) {
      console.error(e);
      showNotification("Chyba spojení", "error");
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      const res = await authorizedFetch(`/attachments/${attachmentId}`, { method: 'DELETE' });
      if (res.ok) {
        // Clean up alt
        const newSettings = { ...(carousel.settings || {}) };
        if (newSettings.attachmentAlts) {
          const newAlts = { ...newSettings.attachmentAlts };
          delete newAlts[attachmentId];
          newSettings.attachmentAlts = newAlts;
        }

        setCarousel({
          ...carousel,
          attachments: carousel.attachments.filter((a) => a.id !== attachmentId),
          settings: newSettings
        });
        showNotification("Logo bylo odstraněno", "success");
      } else {
        showNotification("Nepodařilo se smazat logo", "error");
      }
    } catch {
      showNotification("Chyba při mazání", "error");
    }
  };

  const handleUrlChange = (attachmentId, newUrl) => {
    setCarousel({
      ...carousel,
      attachments: carousel.attachments.map((a) =>
        a.id === attachmentId ? { ...a, link: newUrl } : a
      ),
    });
  };

  const [activeId, setActiveId] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = carousel.attachments.findIndex((a) => a.id === active.id);
    const newIndex = carousel.attachments.findIndex((a) => a.id === over.id);
    setCarousel({
      ...carousel,
      attachments: arrayMove(carousel.attachments, oldIndex, newIndex),
    });
  };

  const updateSettings = (newSettings) => {
    setCarousel({ ...carousel, settings: newSettings });
  };

  if (!activeTab) return null;

  return (
    <aside className="dark w-80 bg-gray-900 border-r border-gray-800 text-white h-full flex flex-col transition-all duration-300">

      {/* Obsah */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
        {activeTab === 'content' && (
          <>
            <div className="mb-6 space-y-4">
              {/* Title Section */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Nadpis carouselu</label>
                <div>
                  <input
                    value={carousel.title || ''}
                    onChange={(e) => setCarousel({ ...carousel, title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 placeholder-gray-500"
                    placeholder="Vložte nadpis"
                  />

                </div>
              </div>

              {/* Subtitle Section - text only for content tab */}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Podnadpis</label>
                <div>
                  <TextArea
                    value={carousel.settings?.subtitleText || ''}
                    onChange={(val) => updateSettings({ ...carousel.settings, subtitleText: val })}
                    placeholder="Doplňkový text pod nadpisem..."
                    rows={2}
                  />
                </div>
              </div>
            </div>


            <div className="mb-4">
              <UploadAttachment widgetId={carousel.id} carousel={carousel} setCarousel={setCarousel} mode="url" />
            </div>

            <hr className="border-gray-800 mb-6" />

            {carousel.attachments?.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={carousel.attachments.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {carousel.attachments.map((item) => (
                      <LogoItemEditor
                        key={item.id}
                        id={item.id}
                        item={item}
                        alt={carousel.settings?.attachmentAlts?.[item.id] || ''}
                        onRemove={() => handleRemoveAttachment(item.id)}
                        onLinkChange={(newUrl) => handleUrlChange(item.id, newUrl)}
                        onAltChange={(newAlt) => handleAltChange(item.id, newAlt)}
                        onReplace={handleReplaceImage}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div className="opacity-90 rotate-2 cursor-grabbing scale-105">
                      {(() => {
                        const item = carousel.attachments.find(a => a.id === activeId);
                        if (!item) return null;
                        return (
                          <LogoItemEditor
                            id={item.id}
                            item={item}
                            alt={carousel.settings?.attachmentAlts?.[item.id] || ''}
                            // Inert handlers for overlay
                            onRemove={() => { }}
                            onLinkChange={() => { }}
                            onAltChange={() => { }}
                            onReplace={() => { }}
                          />
                        );
                      })()}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                Zatím žádná loga. <br />
                Nahrajte první obrázek.
              </div>
            )}

            <div className="mt-2 opacity-75 hover:opacity-100 transition-opacity">
              <UploadAttachment widgetId={carousel.id} carousel={carousel} setCarousel={setCarousel} mode="dropzone" />
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">

            {/* Title Styles */}
            <CollapsibleSection title="Vzhled nadpisu" defaultOpen={false}>
              <StyleControls
                prefix="title"
                settings={carousel.settings || {}}
                onChange={updateSettings}
                defaultMargin={12}
              />
            </CollapsibleSection>

            <hr className="border-gray-800" />

            {/* Subtitle Styles */}
            <CollapsibleSection title="Vzhled podnadpisu" defaultOpen={false}>
              <StyleControls
                prefix="subtitle"
                settings={carousel.settings || {}}
                onChange={updateSettings}
                defaultMargin={24}
              />
            </CollapsibleSection>

            <hr className="border-gray-800" />

            {/* Fade/Edges Styles */}
            <CollapsibleSection title="Okraje" defaultOpen={false}>
              <div className="space-y-4">
                <Toggle
                  checked={carousel.settings?.fadeEnabled !== false}
                  onChange={(val) => updateSettings({ ...carousel.settings, fadeEnabled: val })}
                  label="Zapnout rozmazání okrajů"
                />

                {carousel.settings?.fadeEnabled !== false && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-400">
                          Šířka ({carousel.settings?.fadeWidth ?? (carousel.settings?.fadeWidthUnit === '%' ? 20 : 128)}{carousel.settings?.fadeWidthUnit ?? 'px'})
                        </label>
                        <div className="flex bg-gray-800 rounded p-0.5 border border-gray-700">
                          <button
                            type="button"
                            onClick={() => updateSettings({
                              ...carousel.settings,
                              fadeWidthUnit: 'px',
                              fadeWidth: 128
                            })}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${(!carousel.settings?.fadeWidthUnit || carousel.settings?.fadeWidthUnit === 'px') ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                          >PX</button>
                          <button
                            type="button"
                            onClick={() => updateSettings({
                              ...carousel.settings,
                              fadeWidthUnit: '%',
                              fadeWidth: 20
                            })}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${carousel.settings?.fadeWidthUnit === '%' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                          >%</button>
                        </div>
                      </div>
                      <RangeSlider
                        min={0}
                        max={carousel.settings?.fadeWidthUnit === '%' ? 100 : 1000}
                        step={carousel.settings?.fadeWidthUnit === '%' ? 1 : 8}
                        value={carousel.settings?.fadeWidth ?? (carousel.settings?.fadeWidthUnit === '%' ? 20 : 128)}
                        onChange={(e) => updateSettings({ ...carousel.settings, fadeWidth: parseInt(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">Typ rozmazání</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateSettings({ ...carousel.settings, fadeMode: 'mask' })}
                          className={`p-2 rounded-lg border text-sm transition-all ${(carousel.settings?.fadeMode ?? 'mask') === 'mask'
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                            }`}
                        >
                          Podle pozadí
                        </button>
                        <button
                          onClick={() => updateSettings({ ...carousel.settings, fadeMode: 'color' })}
                          className={`p-2 rounded-lg border text-sm transition-all ${carousel.settings?.fadeMode === 'color'
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                            }`}
                        >
                          Vlastní barva
                        </button>
                      </div>
                    </div>

                    {carousel.settings?.fadeMode === 'color' && (
                      <ColorInput
                        label="Barva okraje"
                        value={carousel.settings?.fadeColor || '#ffffff'}
                        onChange={(val) => updateSettings({ ...carousel.settings, fadeColor: val })}
                      />
                    )}

                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">
                        Průhlednost ({carousel.settings?.fadeOpacity ?? 0}%)
                      </label>
                      <RangeSlider
                        min={0}
                        max={100}
                        step={5}
                        value={carousel.settings?.fadeOpacity ?? 0}
                        onChange={(e) => updateSettings({ ...carousel.settings, fadeOpacity: parseInt(e.target.value) })}
                      />
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>

            <hr className="border-gray-800" />

            {/* Image Styles (New) */}
            <CollapsibleSection title="Vzhled obrázků" defaultOpen={false}>
              <div className="space-y-4">
                {/* Image Size (Moved) */}
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block">
                    Velikost ({carousel.imageSize || 64}px)
                  </label>
                  <RangeSlider
                    min={32}
                    max={128}
                    step={4}
                    value={carousel.imageSize || 64}
                    onChange={(e) => setCarousel({ ...carousel, imageSize: parseInt(e.target.value) })}
                  />
                </div>

                {/* Border Radius */}
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block">
                    Zaoblení ({carousel.settings?.imgRadius ?? 0}px)
                  </label>
                  <RangeSlider
                    min={0}
                    max={64}
                    step={2}
                    value={carousel.settings?.imgRadius ?? 0}
                    onChange={(e) => updateSettings({ ...carousel.settings, imgRadius: parseInt(e.target.value) })}
                  />
                </div>

                {/* Shadow */}
                <Toggle
                  checked={carousel.settings?.shadowEnabled || false}
                  onChange={(val) => updateSettings({ ...carousel.settings, shadowEnabled: val })}
                  label="Stín pod obrázky"
                />

                {carousel.settings?.shadowEnabled && (
                  <>
                    <ColorInput
                      label="Barva stínu"
                      value={carousel.settings?.shadowColor || '#000000'}
                      onChange={(val) => updateSettings({ ...carousel.settings, shadowColor: val })}
                    />

                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">
                        Rozmazání stínu ({carousel.settings?.shadowBlur ?? 10}px)
                      </label>
                      <RangeSlider
                        min={0}
                        max={50}
                        step={1}
                        value={carousel.settings?.shadowBlur ?? 10}
                        onChange={(e) => updateSettings({ ...carousel.settings, shadowBlur: parseInt(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">
                        Průhlednost stínu ({carousel.settings?.shadowOpacity ?? 20}%)
                      </label>
                      <RangeSlider
                        min={0}
                        max={100}
                        step={5}
                        value={carousel.settings?.shadowOpacity ?? 20}
                        onChange={(e) => updateSettings({ ...carousel.settings, shadowOpacity: parseInt(e.target.value) })}
                      />
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>

            <hr className="border-gray-800" />

            {/* Slider/Grid Settings */}
            <CollapsibleSection title="Nastavení slideru" defaultOpen={false}>
              <div className="space-y-4">
                <Toggle
                  checked={carousel.settings?.enableAnimation !== false}
                  onChange={(val) => updateSettings({ ...carousel.settings, enableAnimation: val })}
                  label="Zapnout animaci (jezdící)"
                />

                <div>
                  <label className="text-xs font-medium text-gray-400 mb-2 block">
                    Mezera ({carousel.gap || 32}px)
                  </label>
                  <RangeSlider
                    min={0}
                    max={100}
                    step={4}
                    value={carousel.gap || 32}
                    onChange={(e) => setCarousel({ ...carousel, gap: parseInt(e.target.value) })}
                  />
                </div>

                {carousel.settings?.enableAnimation !== false && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-2 block">
                        Rychlost ({carousel.speed || 20}s)
                      </label>
                      <RangeSlider
                        min={5}
                        max={60}
                        step={1}
                        value={carousel.speed || 20}
                        onChange={(e) => setCarousel({ ...carousel, speed: parseInt(e.target.value) })}
                      />
                    </div>

                    <Toggle
                      checked={carousel.pauseOnHover || false}
                      onChange={(checked) => setCarousel({ ...carousel, pauseOnHover: checked })}
                      label="Zastavit při najetí myši"
                    />
                  </>
                )}
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </aside>
  );
}
