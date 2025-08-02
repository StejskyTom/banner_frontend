'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { rectSortingStrategy } from '@dnd-kit/sortable';

import CarouselPreview from './CarouselPreview';


import {
  useSortable,
  SortableContext,
  defaultAnimateLayoutChanges,
  arrayMove,
  AnimateLayoutChanges,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const animateLayoutChanges = (args) => {
  const shouldAnimate = defaultAnimateLayoutChanges(args);
  return shouldAnimate;
};

function SortableLogo({ id, logo, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-lg relative group cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <img
        src={logo}
        alt={`Logo ${id}`}
        className="h-20 mx-auto object-contain max-w-full"
      />
      <button
        onClick={() => onRemove(logo)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
        title="Smazat"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function SectionList({ logos, setLogos }) {
  const handleAddLogo = () => {
    const newLogo = prompt('Zadej URL loga:');
    if (newLogo) setLogos([...logos, newLogo]);
  };

  const handleRemoveLogo = (logoToRemove) => {
    const updated = logos.filter((logo) => logo !== logoToRemove);
    setLogos(updated);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = active.data.current.sortable.index;
      const newIndex = over.data.current.sortable.index;
      setLogos((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Logo Carousel</h2>
        <button
          onClick={handleAddLogo}
          className="inline-flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Přidat logo
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={logos} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {logos.map((logo, index) => (
              <SortableLogo
                key={logo}
                id={logo}
                logo={logo}
                onRemove={handleRemoveLogo}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

        {logos.length > 0 && (
            <div className="mt-8">
                <h3 className="text-lg font-medium mb-2">Live náhled carouselu</h3>
                <CarouselPreview logos={logos} />
            </div>
        )}
    </div>
  );
}
