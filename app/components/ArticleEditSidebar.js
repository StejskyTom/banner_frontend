'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
    Bars3BottomLeftIcon,
    PhotoIcon,
    TableCellsIcon,
    MegaphoneIcon,
    ShoppingBagIcon,
    UserCircleIcon,
    DocumentTextIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/solid';
import {
    TextProperties,
    ImageProperties,
    WrapProperties,
    TableProperties,
    BannerProperties,
    ProductProperties,
    AuthorProperties
} from './article/BlockProperties';

// --- Draggable Palette Item ---
function DraggablePaletteItem({ type, icon: Icon, label }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `palette-${type}`,
        data: {
            type,
            isPaletteItem: true,
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-700 rounded-lg cursor-grab hover:bg-gray-700 hover:border-gray-600 transition-colors group"
        >
            <div className="p-2 rounded-md bg-gray-700 text-gray-400 group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                {label}
            </span>
        </div>
    );
}

export default function ArticleEditSidebar({
    widget,
    setWidget,
    activeTab,
    selectedBlockId,
    setSelectedBlockId,
    activeFormats
}) {
    const handleUpdateBlock = (updatedBlock) => {
        setWidget((prev) => ({
            ...prev,
            blocks: prev.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
        }));
    };

    const selectedBlock = widget.blocks.find(b => b.id === selectedBlockId);

    if (!activeTab) return null;

    if (activeTab === 'settings') {
        return (
            <div className="dark w-80 bg-gray-900 border-r border-gray-800 text-white flex flex-col h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="font-semibold text-white">Nastavení</h2>
                </div>
                <div className="p-4 text-gray-500 text-sm text-center">
                    Zatím prázdné
                </div>
            </div>
        );
    }

    if (activeTab === 'content') {
        return (
            <div className="dark w-80 bg-gray-900 border-r border-gray-800 text-white flex flex-col h-full overflow-hidden">
                {selectedBlock ? (
                    // --- Block Properties View ---
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                            <button
                                onClick={() => setSelectedBlockId(null)}
                                className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <h2 className="font-semibold text-white">Úprava bloku</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {selectedBlock.type === 'text' && (
                                <TextProperties block={selectedBlock} onChange={handleUpdateBlock} activeFormats={activeFormats} />
                            )}
                            {selectedBlock.type === 'image' && (
                                <ImageProperties block={selectedBlock} onChange={handleUpdateBlock} widgetId={widget.id} />
                            )}
                            {selectedBlock.type === 'wrap' && (
                                <WrapProperties block={selectedBlock} onChange={handleUpdateBlock} widgetId={widget.id} activeFormats={activeFormats} />
                            )}
                            {selectedBlock.type === 'table' && (
                                <TableProperties block={selectedBlock} onChange={handleUpdateBlock} />
                            )}
                            {selectedBlock.type === 'banner' && (
                                <BannerProperties block={selectedBlock} onChange={handleUpdateBlock} />
                            )}
                            {selectedBlock.type === 'product' && (
                                <ProductProperties block={selectedBlock} onChange={handleUpdateBlock} widgetId={widget.id} />
                            )}
                            {selectedBlock.type === 'author' && (
                                <AuthorProperties block={selectedBlock} onChange={handleUpdateBlock} widgetId={widget.id} />
                            )}
                        </div>
                    </div>
                ) : (
                    // --- Palette View ---
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-gray-800">
                            <h2 className="font-semibold text-white">Dostupné bloky</h2>
                            <p className="text-xs text-gray-500 mt-1">Přetáhněte bloky do náhledu</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="space-y-3">
                                <DraggablePaletteItem type="text" label="Text" icon={Bars3BottomLeftIcon} />
                                <DraggablePaletteItem type="image" label="Obrázek" icon={PhotoIcon} />
                                <DraggablePaletteItem type="wrap" label="Text a obrázek" icon={PhotoIcon} />
                                <DraggablePaletteItem type="table" label="Tabulka" icon={TableCellsIcon} />
                                <DraggablePaletteItem type="banner" label="Banner" icon={MegaphoneIcon} />
                                <DraggablePaletteItem type="product" label="Produkt" icon={ShoppingBagIcon} />
                                <DraggablePaletteItem type="author" label="Autor" icon={UserCircleIcon} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
}
