'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors, MouseSensor, TouchSensor, KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrashIcon } from '@heroicons/react/24/outline';


function SortableLogoItem({ id, logo, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        onClick={(e) => {
          onRemove(logo);
        }}
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

  const handleAddLogo = () => {
    if (!newLogo.trim()) return;

    const updatedCarousel = {
      ...carousel,
      logos: [...carousel.logos, newLogo.trim()],
    };

    setCarousel(updatedCarousel);
    setNewLogo('');
  };

  const handleRemoveLogo = (logoToRemove) => {
    setCarousel({
      ...carousel,
      logos: carousel.logos.filter((l) => l !== logoToRemove),
    });
  };

  const handleTitleChange = () => {
    setCarousel({ ...carousel, title });
  };

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 0.01
    }
  })
  const mouseSensor = useSensor(MouseSensor)
  const touchSensor = useSensor(TouchSensor)
  const keyboardSensor = useSensor(KeyboardSensor)

  const sensors = useSensors(
      mouseSensor,
      touchSensor,
      keyboardSensor,
      pointerSensor
  )

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = carousel.logos.findIndex((l) => l === active.id);
      const newIndex = carousel.logos.findIndex((l) => l === over.id);
      const reordered = arrayMove(carousel.logos, oldIndex, newIndex);
      setCarousel({ ...carousel, logos: reordered });
    }
  };

  return (
    <aside className="w-80 bg-gray-50 border-l border-gray-200 text-gray-800 p-4 space-y-6 h-screen">
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

  {/* Přidávání nového loga */}
  <div>
    <label className="text-sm font-medium text-gray-700">Nové logo (URL)</label>
    <div className="flex gap-2 mt-1">
      <input
        value={newLogo}
        onChange={(e) => setNewLogo(e.target.value)}
        className="flex-1 bg-white border border-gray-300 text-sm px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleAddLogo}
        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm shadow-sm"
      >
        Přidat
      </button>
    </div>
  </div>

  {/* Seznam log */}
  {carousel.logos.length > 0 && (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Seznam log</h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={carousel.logos} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3">
            {carousel.logos.map((logo) => (
              <SortableLogoItem
                key={logo}
                id={logo}
                logo={logo}
                onRemove={handleRemoveLogo}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )}
</aside>
  );
}
