'use client';

import { useState } from 'react';
import { Upload } from "lucide-react";
import UploadAttachment from "../../app/components/UploadAttachment";
import { useToast } from "../../app/components/ToastProvider";
import { authorizedFetch } from "../../lib/api";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  MouseSensor, TouchSensor, KeyboardSensor
} from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrashIcon } from '@heroicons/react/24/outline';
import RangeSlider from './RangeSlider';
import Toggle from './Toggle';

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      {icon}
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    </div>
  );
}

function SortableLogoItem({ id, logo, url, onRemove, onUrlChange, imageSize }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div className="flex flex-col gap-1">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="relative bg-gray-800 p-2 rounded flex items-center justify-center cursor-move shadow-sm border border-gray-700 group"
      >
        <img
          src={logo}
          alt=""
          className="object-contain"
          style={{ height: `${imageSize}px`, maxWidth: `${imageSize + 40}px` }}
        />
        <button
          data-no-dnd="true"
          onClick={onRemove}
          className="absolute top-1 right-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Smazat logo"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      <input
        type="url"
        placeholder="https://..."
        value={url || ''}
        onChange={(e) => onUrlChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="w-full text-xs px-2 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-visualy-accent-4 placeholder-gray-600"
      />
    </div>
  );
}

export default function EditSidebar({ carousel, setCarousel, activeTab }) {
  const [title, setTitle] = useState(carousel.title);
  const showNotification = useToast();

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
    useSensor(PointerSensor, { activationConstraint: { distance: 0.01 } })
  );

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      const res = await authorizedFetch(`/attachments/${attachmentId}`, { method: 'DELETE' });
      if (res.ok) {
        setCarousel({
          ...carousel,
          attachments: carousel.attachments.filter((a) => a.id !== attachmentId),
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = carousel.attachments.findIndex((a) => a.id === active.id);
    const newIndex = carousel.attachments.findIndex((a) => a.id === over.id);
    setCarousel({
      ...carousel,
      attachments: arrayMove(carousel.attachments, oldIndex, newIndex),
    });
  };

  if (!activeTab) return null;

  return (
    <aside className="dark w-80 bg-gray-900 border-r border-gray-800 text-white h-full flex flex-col transition-all duration-300">

      {/* Obsah */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'content' && (
          <>
            <div className="mb-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Nadpis carouselu</label>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setCarousel({ ...carousel, title: e.target.value });
                  }}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 placeholder-gray-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Font</label>
                <select
                  value={carousel.font || "sans-serif"}
                  onChange={(e) => setCarousel({ ...carousel, font: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                  <option value="cursive">Cursive</option>
                </select>
              </div>
            </div>

            <hr className="border-gray-800 mb-6" />

            <UploadAttachment widgetId={carousel.id} carousel={carousel} setCarousel={setCarousel} />

            {carousel.attachments?.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={carousel.attachments.map((a) => a.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {carousel.attachments.map((a) => (
                      <SortableLogoItem
                        key={a.id}
                        id={a.id}
                        logo={a.url}
                        url={a.link}
                        imageSize={64}
                        onRemove={() => handleRemoveAttachment(a.id)}
                        onUrlChange={(newUrl) => handleUrlChange(a.id, newUrl)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                Zatím žádná loga. <br />
                Nahrajte první obrázek.
              </div>
            )}
          </>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-3 block">
                Velikost obrázků ({carousel.imageSize || 64}px)
              </label>
              <RangeSlider
                min={32}
                max={128}
                step={4}
                value={carousel.imageSize || 64}
                onChange={(e) => setCarousel({ ...carousel, imageSize: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 mb-3 block">
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

            <hr className="border-gray-800" />

            <div>
              <label className="text-xs font-medium text-gray-400 mb-3 block">
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
          </div>
        )}
      </div>
    </aside>
  );
}
