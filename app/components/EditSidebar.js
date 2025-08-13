'use client';

import { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

function SectionTitle({ icon, title }) {
  return (
      <div className="flex items-center gap-2 mt-4 mb-2">
        {icon}
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
  );
}

function SortableLogoItem({ id, logo, onRemove, imageSize }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
      <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="relative bg-gray-100 p-2 rounded flex items-center justify-center cursor-move shadow-sm"
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
            className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
            title="Smazat logo"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
  );
}

export default function EditSidebar({ carousel, setCarousel }) {
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
        showNotification("Nepodařilo se smazat logo", "danger");
      }
    } catch {
      showNotification("Chyba při mazání", "danger");
    }
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

  return (
      <aside className="w-80 bg-white border-l border-gray-200 text-gray-800 h-screen flex flex-col">
        {/* Hlavička */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold">Nastavení carouselu</h2>
        </div>

        {/* Obsah */}
        <div className="flex-1 overflow-y-auto p-4">

          <label className="text-xs text-gray-600">Nadpis carouselu</label>
          <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setCarousel({ ...carousel, title: e.target.value });
              }}
              className="w-full mt-1 mb-4 bg-white border border-gray-300 text-sm px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="text-xs text-gray-600">Font</label>
          <Select
              value={carousel.font || "sans-serif"}
              onValueChange={(val) => setCarousel({ ...carousel, font: val })}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Vyber font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sans-serif">Sans Serif</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="monospace">Monospace</SelectItem>
              <SelectItem value="cursive">Cursive</SelectItem>
            </SelectContent>
          </Select>

          <Separator className="my-4" />

          {/* OBRÁZKY */}
          <UploadAttachment widgetId={carousel.id} carousel={carousel} setCarousel={setCarousel} />

          {carousel.attachments?.length > 0 && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={carousel.attachments.map((a) => a.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {carousel.attachments.map((a) => (
                        <SortableLogoItem
                            key={a.id}
                            id={a.id}
                            logo={a.url}
                            imageSize={64}
                            onRemove={() => handleRemoveAttachment(a.id)}
                        />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
          )}

          <label className="text-xs text-gray-600 mt-4 block">Velikost obrázků</label>
          <Slider
              min={32}
              max={128}
              step={4}
              value={[carousel.imageSize || 64]}
              onValueChange={(val) => setCarousel({ ...carousel, imageSize: val[0] })}
              className="mt-2"
          />

          <Separator className="my-4" />

          <label className="text-xs text-gray-600">Rychlost (sekundy)</label>
          <Slider
              min={5}
              max={60}
              step={1}
              value={[carousel.speed || 20]}
              onValueChange={(val) => setCarousel({ ...carousel, speed: val[0] })}
              className="mt-2"
          />

        </div>
      </aside>
  );
}
