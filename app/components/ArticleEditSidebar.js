'use client';

import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { authorizedFetch } from '../../lib/api';
import { useToast } from './ToastProvider';
import {
    Bars3BottomLeftIcon,
    PhotoIcon,
    TableCellsIcon,
    MegaphoneIcon,
    ShoppingBagIcon,
    UserCircleIcon,
    DocumentTextIcon,
    ChevronLeftIcon,
    ViewColumnsIcon,
    BookmarkIcon,
    XMarkIcon,
    PencilIcon,
    CheckIcon,
    BookmarkSquareIcon,
    ArrowPathIcon,
    LinkSlashIcon,
} from '@heroicons/react/24/solid';
import {
    TextProperties,
    ImageProperties,
    WrapProperties,
    TableProperties,
    BannerProperties,
    ProductProperties,
    AuthorProperties,
    LayoutProperties
} from './article/BlockProperties';

const BLOCK_TYPE_ICONS = {
    text: Bars3BottomLeftIcon,
    image: PhotoIcon,
    wrap: PhotoIcon,
    table: TableCellsIcon,
    banner: MegaphoneIcon,
    product: ShoppingBagIcon,
    author: UserCircleIcon,
    layout: ViewColumnsIcon,
};

const BLOCK_TYPE_LABELS = {
    text: 'Text',
    image: 'Obrázek',
    wrap: 'Text a obrázek',
    table: 'Tabulka',
    banner: 'Banner',
    product: 'Produkt',
    author: 'Autor',
    layout: 'Layout',
};

// --- Draggable Palette Item ---
function DraggablePaletteItem({ type, icon: Icon, label, savedBlockData }) {
    const draggableId = savedBlockData ? `saved-${savedBlockData._savedId}` : `palette-${type}`;
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: draggableId,
        data: {
            type: savedBlockData ? 'saved' : type,
            isPaletteItem: true,
            savedBlockData: savedBlockData || null,
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
            <span className="text-sm font-medium text-gray-200 group-hover:text-white truncate flex-1">
                {label}
            </span>
        </div>
    );
}

// --- Saved Block Item with delete/rename ---
function SavedBlockItem({ savedBlock, onDelete, onRename }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(savedBlock.name);
    const Icon = BLOCK_TYPE_ICONS[savedBlock.blockType] || BookmarkIcon;

    const handleRename = () => {
        if (editName.trim() && editName !== savedBlock.name) {
            onRename(savedBlock.id, editName.trim());
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-3 p-3 bg-gray-800 border border-visualy-accent-4/50 rounded-lg">
                <div className="p-2 rounded-md bg-gray-700 text-visualy-accent-4 shrink-0">
                    <Icon className="h-5 w-5" />
                </div>
                <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsEditing(false); }}
                    onBlur={handleRename}
                    className="flex-1 min-w-0 bg-gray-700 border-none text-white text-sm px-2 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-visualy-accent-4 placeholder-gray-500"
                    placeholder="Název šablony..."
                />
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleRename}
                    className="p-1.5 text-visualy-accent-4 hover:bg-visualy-accent-4/20 rounded-md transition-colors shrink-0"
                    title="Potvrdit"
                >
                    <CheckIcon className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1">
            <div className="flex-1 min-w-0">
                <DraggablePaletteItem
                    type={savedBlock.blockType}
                    icon={Icon}
                    label={savedBlock.name}
                    savedBlockData={{ ...savedBlock.blockData, _savedId: savedBlock.id, _blockType: savedBlock.blockType }}
                />
            </div>
            <div className="flex flex-col gap-1 shrink-0">
                <button
                    onClick={() => { setIsEditing(true); setEditName(savedBlock.name); }}
                    className="p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
                    title="Přejmenovat"
                >
                    <PencilIcon className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(savedBlock.id); }}
                    className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    title="Smazat šablonu"
                >
                    <XMarkIcon className="h-3.5 w-3.5" />
                </button>
            </div>
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
    const showNotification = useToast();
    const [savedBlocks, setSavedBlocks] = useState([]);
    const [showSavePrompt, setShowSavePrompt] = useState(false);
    const [saveBlockName, setSaveBlockName] = useState('');

    useEffect(() => {
        fetchSavedBlocks();
    }, []);

    const fetchSavedBlocks = async () => {
        try {
            const res = await authorizedFetch('/saved-blocks');
            if (res.ok) {
                const data = await res.json();
                setSavedBlocks(data);
            }
        } catch (error) {
            console.error('Error fetching saved blocks:', error);
        }
    };

    const stripIds = (block) => {
        const { id, savedBlockId, ...data } = block;
        if (data.type === 'layout' && data.columns) {
            data.columns = data.columns.map(col => ({
                ...col,
                id: undefined,
                blocks: (col.blocks || []).map(stripIds)
            }));
        }
        return data;
    };

    const [propagating, setPropagating] = useState(false);

    const propagateInLocalBlocks = (blocks, savedBlockId, skipBlockId, newData) => {
        return blocks.map(b => {
            if (b.savedBlockId === savedBlockId && b.id !== skipBlockId) {
                return {
                    ...newData,
                    id: b.id,
                    savedBlockId: savedBlockId,
                    type: newData.type || b.type,
                    margin: b.margin,
                };
            }
            if (b.type === 'layout' && b.columns) {
                return {
                    ...b,
                    columns: b.columns.map(col => ({
                        ...col,
                        blocks: propagateInLocalBlocks(col.blocks || [], savedBlockId, skipBlockId, newData)
                    }))
                };
            }
            return b;
        });
    };

    const handlePropagate = async () => {
        if (!selectedBlock?.savedBlockId) return;
        setPropagating(true);

        try {
            const blockData = stripIds(selectedBlock);
            const res = await authorizedFetch(`/saved-blocks/${selectedBlock.savedBlockId}/propagate`, {
                method: 'POST',
                body: JSON.stringify({
                    blockData,
                    excludeWidgetId: widget.id,
                }),
            });

            if (res.ok) {
                const result = await res.json();

                // Also update other instances of this global block in the current widget
                setWidget(prev => ({
                    ...prev,
                    blocks: propagateInLocalBlocks(prev.blocks, selectedBlock.savedBlockId, selectedBlock.id, blockData)
                }));

                showNotification(`Změny promítnuty do ${result.updatedWidgets} dalších widgetů`, 'success');
            } else {
                showNotification('Nepodařilo se promítnout změny', 'error');
            }
        } catch (error) {
            console.error('Error propagating block:', error);
            showNotification('Chyba při promítání změn', 'error');
        } finally {
            setPropagating(false);
        }
    };

    const handleUnlink = () => {
        if (!selectedBlock?.savedBlockId) return;
        const { savedBlockId, ...unlinkData } = selectedBlock;
        handleUpdateBlock(unlinkData);
        showNotification('Blok odpojen od šablony', 'success');
    };

    const handleSaveBlock = async () => {
        if (!selectedBlock || !saveBlockName.trim()) return;

        const blockData = stripIds(selectedBlock);

        try {
            const res = await authorizedFetch('/saved-blocks', {
                method: 'POST',
                body: JSON.stringify({
                    name: saveBlockName.trim(),
                    blockType: selectedBlock.type,
                    blockData,
                }),
            });

            if (res.ok) {
                showNotification('Šablona uložena', 'success');
                setShowSavePrompt(false);
                setSaveBlockName('');
                fetchSavedBlocks();
            } else {
                showNotification('Nepodařilo se uložit šablonu', 'error');
            }
        } catch (error) {
            console.error('Error saving block:', error);
            showNotification('Chyba při ukládání šablony', 'error');
        }
    };

    const handleDeleteSavedBlock = async (id) => {
        try {
            const res = await authorizedFetch(`/saved-blocks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification('Šablona smazána', 'success');
                setSavedBlocks(prev => prev.filter(b => b.id !== id));
            } else {
                showNotification('Nepodařilo se smazat šablonu', 'error');
            }
        } catch (error) {
            console.error('Error deleting saved block:', error);
        }
    };

    const handleRenameSavedBlock = async (id, newName) => {
        try {
            const res = await authorizedFetch(`/saved-blocks/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: newName }),
            });
            if (res.ok) {
                setSavedBlocks(prev => prev.map(b => b.id === id ? { ...b, name: newName } : b));
                showNotification('Šablona přejmenována', 'success');
            }
        } catch (error) {
            console.error('Error renaming saved block:', error);
        }
    };

    const findBlockRecursive = (blocks, id) => {
        for (const b of blocks) {
            if (b.id === id) return b;
            if (b.type === 'layout' && b.columns) {
                for (const col of b.columns) {
                    const found = findBlockRecursive(col.blocks || [], id);
                    if (found) return found;
                }
            }
        }
        return null;
    };

    const updateBlocksRecursive = (blocks, updatedBlock) => {
        return blocks.map(b => {
            if (b.id === updatedBlock.id) return updatedBlock;
            if (b.type === 'layout' && b.columns) {
                return {
                    ...b,
                    columns: b.columns.map(col => ({
                        ...col,
                        blocks: updateBlocksRecursive(col.blocks || [], updatedBlock)
                    }))
                };
            }
            return b;
        });
    };

    const handleUpdateBlock = (updatedBlock) => {
        setWidget((prev) => ({
            ...prev,
            blocks: updateBlocksRecursive(prev.blocks, updatedBlock),
        }));
    };

    const selectedBlock = findBlockRecursive(widget.blocks, selectedBlockId);

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
                            {selectedBlock.type === 'layout' && (
                                <LayoutProperties block={selectedBlock} onChange={handleUpdateBlock} />
                            )}

                            {/* Template Actions */}
                            <div className="mt-6 pt-4 border-t border-gray-800">
                                {selectedBlock.savedBlockId ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-visualy-accent-4/10 rounded-lg border border-visualy-accent-4/20">
                                            <BookmarkIcon className="h-4 w-4 text-visualy-accent-4 shrink-0" />
                                            <span className="text-xs text-visualy-accent-4 font-medium">Globální šablona</span>
                                        </div>
                                        <button
                                            onClick={handlePropagate}
                                            disabled={propagating}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-visualy-accent-4 hover:bg-visualy-accent-4/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            <ArrowPathIcon className={`h-4 w-4 ${propagating ? 'animate-spin' : ''}`} />
                                            {propagating ? 'Promítám...' : 'Promítnout do všech'}
                                        </button>
                                        <button
                                            onClick={handleUnlink}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-300 text-xs font-medium transition-colors"
                                        >
                                            <LinkSlashIcon className="h-3.5 w-3.5" />
                                            Odpojit od šablony
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {showSavePrompt ? (
                                            <div className="space-y-2">
                                                <input
                                                    autoFocus
                                                    value={saveBlockName}
                                                    onChange={(e) => setSaveBlockName(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveBlock(); if (e.key === 'Escape') setShowSavePrompt(false); }}
                                                    placeholder="Název šablony..."
                                                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-visualy-accent-4 placeholder-gray-500"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveBlock}
                                                        disabled={!saveBlockName.trim()}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-visualy-accent-4 hover:bg-visualy-accent-4/90 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        <CheckIcon className="h-4 w-4" />
                                                        Uložit
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowSavePrompt(false); setSaveBlockName(''); }}
                                                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg border border-gray-700 transition-colors"
                                                    >
                                                        Zrušit
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const defaultName = BLOCK_TYPE_LABELS[selectedBlock.type] || selectedBlock.type;
                                                    setSaveBlockName(defaultName);
                                                    setShowSavePrompt(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-visualy-accent-4/10 hover:bg-visualy-accent-4/20 text-visualy-accent-4 text-sm font-medium rounded-lg border border-visualy-accent-4/30 transition-colors"
                                            >
                                                <BookmarkSquareIcon className="h-4 w-4" />
                                                Uložit jako šablonu
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
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
                                <DraggablePaletteItem type="layout" label="Layout" icon={ViewColumnsIcon} />
                                <DraggablePaletteItem type="text" label="Text" icon={Bars3BottomLeftIcon} />
                                <DraggablePaletteItem type="image" label="Obrázek" icon={PhotoIcon} />
                                <DraggablePaletteItem type="wrap" label="Text a obrázek" icon={PhotoIcon} />
                                <DraggablePaletteItem type="table" label="Tabulka" icon={TableCellsIcon} />
                                <DraggablePaletteItem type="banner" label="Banner" icon={MegaphoneIcon} />
                                <DraggablePaletteItem type="product" label="Produkt" icon={ShoppingBagIcon} />
                                <DraggablePaletteItem type="author" label="Autor" icon={UserCircleIcon} />
                            </div>

                            {/* Saved Templates */}
                            {savedBlocks.length > 0 && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-px flex-1 bg-gray-800" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uložené šablony</span>
                                        <div className="h-px flex-1 bg-gray-800" />
                                    </div>
                                    <div className="space-y-2">
                                        {savedBlocks.map(sb => (
                                            <SavedBlockItem
                                                key={sb.id}
                                                savedBlock={sb}
                                                onDelete={handleDeleteSavedBlock}
                                                onRename={handleRenameSavedBlock}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
}
