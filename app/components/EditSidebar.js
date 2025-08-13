'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrashIcon } from '@heroicons/react/24/outline';
import UploadAttachment from "../../app/components/UploadAttachment";
import {authorizedFetch} from "../../lib/api";
import {useToast} from "../../app/components/ToastProvider";

function SortableLogoItem({ id, logo, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
      <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="relative bg-gray-800 p-2 rounded flex items-center justify-center cursor-move"
      >
        <img src={logo} alt="" className="h-12 object-contain max-w-[80px]" />
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
  const [newLogo, setNewLogo] = useState('');
  const [title, setTitle] = useState(carousel.title);
  const showNotification = useToast();

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 0.01 } });
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor, pointerSensor);

  const handleAddLogo = () => {
    if (!newLogo.trim()) return;

    const newAttachment = {
      id: `temp-${Date.now()}`, // dočasné ID pro FE
      url: newLogo.trim(),
    };

    setCarousel({
      ...carousel,
      attachments: [...(carousel.attachments || []), newAttachment],
    });

    setNewLogo('');
  };

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      const res = await authorizedFetch(`/attachments/${attachmentId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setCarousel({
          ...carousel,
          attachments: carousel.attachments.filter((a) => a.id !== attachmentId),
        });
        showNotification("Logo bylo odstraněno", "success");
      } else {
        showNotification("Nepodařilo se smazat logo", "danger");
      }
    } catch (err) {
      console.error("Chyba při mazání attachmentu", err);
      showNotification("Chyba při mazání", "danger");
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = carousel.attachments.findIndex((a) => a.id === active.id);
    const newIndex = carousel.attachments.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(carousel.attachments, oldIndex, newIndex);

    setCarousel({ ...carousel, attachments: reordered });
  };

  return (
      <aside className="w-80 bg-gray-50 border-l border-gray-200 text-gray-800 h-screen flex flex-col">
        {/* Fixní hlavička sidebaru */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nastavení carouselu</h2>
        </div>

        {/* Scrollovatelný obsah */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Nadpis */}
          <div>
            <label className="text-sm font-medium text-gray-700">Nadpis carouselu</label>
            <input
                value={title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTitle(newTitle);
                  setCarousel({ ...carousel, title: newTitle });
                }}
                className="w-full mt-1 bg-white border border-gray-300 text-sm px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Upload souboru */}
          <div className="pb-2">
            <UploadAttachment
                widgetId={carousel.id}
                carousel={carousel}
                setCarousel={setCarousel}
            />
          </div>

          {/* Seznam log */}
          {carousel.attachments?.length > 0 && (
              <div className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Seznam log ({carousel.attachments.length})
                  </h3>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={carousel.attachments.map((a) => a.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 gap-3">
                      {carousel.attachments.map((a) => (
                          <SortableLogoItem
                              key={a.id}
                              id={a.id}
                              logo={`${a.url}`}
                              onRemove={() => handleRemoveAttachment(a.id)}
                          />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
          )}

          {/* Prázdný stav */}
          {(!carousel.attachments || carousel.attachments.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm">Zatím nejsou nahrána žádná loga</p>
                <p className="text-xs text-gray-400 mt-1">Použijte formulář výše pro přidání</p>
              </div>
          )}
        </div>

        {/* Volitelně: Fixní patička se statistikami nebo akcemi */}
        {carousel.attachments?.length > 0 && (
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-100">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Celkem log:</span>
                  <span className="font-medium">{carousel.attachments.length}</span>
                </div>
                <p className="text-gray-500 mt-2">Tip: Přetažením změníte pořadí</p>
              </div>
            </div>
        )}
      </aside>
  );
}