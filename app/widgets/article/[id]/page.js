'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from '../../../components/ToastProvider';
import Link from 'next/link';
import Loader from '../../../components/Loader';
import ArticleEditSidebar from '../../../components/ArticleEditSidebar';
import ArticlePreview from '../../../components/ArticlePreview';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    pointerWithin,
    PointerSensor,
    useSensor,
    useSensors,
    KeyboardSensor
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import {
    ArrowLeftIcon,
    CodeBracketIcon,
    ClipboardDocumentIcon,
    XMarkIcon,
    TableCellsIcon,
    Cog6ToothIcon,
    Bars3BottomLeftIcon,
    PhotoIcon,
    MegaphoneIcon,
    ShoppingBagIcon,
    UserCircleIcon
} from '@heroicons/react/24/solid';

export default function ArticleEditPage() {
    const { id } = useParams();
    const [widget, setWidget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [activeFormats, setActiveFormats] = useState({});
    const [activeDragItem, setActiveDragItem] = useState(null);
    const showNotification = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchWidget();
    }, [id]);

    const fetchWidget = async () => {
        try {
            const res = await authorizedFetch(`/article-widgets/${id}`);
            if (res.ok) {
                const data = await res.json();
                const blocksWithIds = (data.content || []).map(block => ({
                    ...block,
                    id: block.id || crypto.randomUUID()
                }));
                setWidget({ ...data, blocks: blocksWithIds });
            } else {
                showNotification('Nepodařilo se načíst widget', 'error');
            }
        } catch (error) {
            console.error('Error fetching widget:', error);
            showNotification('Chyba při načítání widgetu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await authorizedFetch(`/article-widgets/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: widget.name,
                    content: widget.blocks,
                }),
            });

            if (res.ok) {
                showNotification('Změny byly uloženy', 'success');
            } else {
                showNotification('Nepodařilo se uložit změny', 'error');
            }
        } catch (error) {
            console.error('Error saving widget:', error);
            showNotification('Chyba při ukládání', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateBlock = (updatedBlock) => {
        setWidget(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b)
        }));
    };

    const handleDeleteBlock = (blockId) => {
        setWidget(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== blockId)
        }));
        if (selectedBlockId === blockId) setSelectedBlockId(null);
    };

    const createNewBlock = (type) => {
        let newBlock = {
            id: crypto.randomUUID(),
            type,
            margin: 24,
        };

        if (type === 'text') { newBlock.content = 'Nový textový blok'; newBlock.tag = 'p'; }
        if (type === 'image') { newBlock.url = ''; newBlock.width = 100; newBlock.align = 'center'; }
        if (type === 'wrap') { newBlock.content = 'Text s obtékáním'; newBlock.imgUrl = ''; newBlock.imgWidth = 40; newBlock.imgPos = 'right'; }
        if (type === 'banner') { newBlock.content = 'NADPIS SEKCE'; newBlock.bgColor = '#f3f4f6'; newBlock.textColor = '#111827'; }
        if (type === 'product') { newBlock.name = 'Nový produkt'; newBlock.link = ''; newBlock.imgUrl = ''; newBlock.price = ''; newBlock.btnText = 'Koupit'; }
        if (type === 'table') {
            newBlock.rows = 3;
            newBlock.cols = 3;
            newBlock.header = ['Sloupec 1', 'Sloupec 2', 'Sloupec 3'];
            newBlock.data = [['', '', ''], ['', '', ''], ['', '', '']];
            newBlock.borderStyle = 'full';
            newBlock.outerBorder = true;
            newBlock.width = 100;
            newBlock.textAlign = 'left';
            newBlock.headerBgColor = '#f3f4f6';
            newBlock.headerTextColor = '#111827';
            newBlock.borderRadius = 8;
        }
        if (type === 'author') { newBlock.layout = 'centered'; }

        return newBlock;
    };

    const handleDragStart = (event) => {
        setActiveDragItem(event.active);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (!over) return;

        // Handle drop from Palette
        if (active.data.current?.isPaletteItem) {
            const type = active.data.current.type;
            const newBlock = createNewBlock(type);

            setWidget((prev) => {
                const overIndex = prev.blocks.findIndex((b) => b.id === over.id);
                let newBlocks = [...prev.blocks];

                if (overIndex >= 0) {
                    // Insert before the hovered item
                    newBlocks.splice(overIndex, 0, newBlock);
                } else if (over.id === 'preview-area' || over.id === 'append-zone') {
                    // Append to end (if dropped on container or append zone)
                    newBlocks.push(newBlock);
                }

                return { ...prev, blocks: newBlocks };
            });

            setSelectedBlockId(newBlock.id);
            return;
        }

        // Handle reordering
        if (active.id !== over.id) {
            setWidget((prev) => {
                const oldIndex = prev.blocks.findIndex((b) => b.id === active.id);
                const newIndex = prev.blocks.findIndex((b) => b.id === over.id);

                return {
                    ...prev,
                    blocks: arrayMove(prev.blocks, oldIndex, newIndex),
                };
            });
        }
    };

    const generateEmbedCode = () => {
        const embedUrl = `${process.env.NEXT_PUBLIC_API_URL}/article-widgets/${id}/embed.js`;
        return `<script src="${embedUrl}" async></script>`;
    };

    const copyEmbedCode = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        showNotification('Kód zkopírován do schránky', 'success');
    };

    if (loading) return <Loader />;
    if (!widget) return <div className="p-8 text-center text-red-500">Widget nenalezen</div>;

    return (
        <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
                {/* Top Bar */}
                <div className="h-16 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-6 shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/widgets/article"
                            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Link>
                        <h1 className="text-lg font-semibold text-white truncate max-w-md">
                            {widget.name}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowEmbedModal(true)}
                            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-medium text-sm flex items-center gap-2"
                        >
                            <CodeBracketIcon className="h-4 w-4" />
                            Publikovat
                        </button>

                        <button
                            disabled={saving}
                            onClick={handleSave}
                            className="px-4 py-2 rounded-lg bg-visualy-accent-4 text-white hover:bg-visualy-accent-4/90 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {saving ? (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                            ) : (
                                "Uložit"
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Icon Sidebar */}
                    <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-4 shrink-0 z-20">
                        <div className="group relative flex items-center justify-center w-full">
                            <button
                                onClick={() => setActiveTab(activeTab === 'content' ? null : 'content')}
                                className={`p-3 rounded-xl transition-all duration-200 ${activeTab === 'content'
                                    ? 'bg-gray-800 text-white shadow-sm'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <TableCellsIcon className="h-6 w-6 text-visualy-accent-4" />
                            </button>
                            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md border border-gray-800 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                Obsah
                            </div>
                        </div>

                        <div className="group relative flex items-center justify-center w-full">
                            <button
                                onClick={() => setActiveTab(activeTab === 'settings' ? null : 'settings')}
                                className={`p-3 rounded-xl transition-all duration-200 ${activeTab === 'settings'
                                    ? 'bg-gray-800 text-white shadow-sm'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Cog6ToothIcon className="h-6 w-6 text-visualy-accent-4" />
                            </button>
                            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md border border-gray-800 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                Nastavení
                            </div>
                        </div>
                    </div>

                    {/* Edit Sidebar */}
                    <ArticleEditSidebar
                        widget={widget}
                        setWidget={setWidget}
                        activeTab={activeTab}
                        selectedBlockId={selectedBlockId}
                        setSelectedBlockId={setSelectedBlockId}
                        activeFormats={activeFormats}
                    />

                    {/* Preview Area */}
                    <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center bg-gray-50 dark:bg-gray-900/50">
                        <ArticlePreview
                            blocks={widget.blocks}
                            selectedBlockId={selectedBlockId}
                            onSelectBlock={setSelectedBlockId}
                            onUpdateBlock={handleUpdateBlock}
                            onFormatChange={setActiveFormats}
                            onDeleteBlock={handleDeleteBlock}
                        />
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeDragItem ? (
                        <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl text-white flex items-center gap-3 w-48 opacity-90">
                            <div className="p-2 rounded-md bg-gray-700 text-white">
                                {activeDragItem.data.current?.type === 'text' && <Bars3BottomLeftIcon className="h-5 w-5" />}
                                {activeDragItem.data.current?.type === 'image' && <PhotoIcon className="h-5 w-5" />}
                                {activeDragItem.data.current?.type === 'wrap' && <PhotoIcon className="h-5 w-5" />}
                                {activeDragItem.data.current?.type === 'table' && <TableCellsIcon className="h-5 w-5" />}
                                {activeDragItem.data.current?.type === 'banner' && <MegaphoneIcon className="h-5 w-5" />}
                                {activeDragItem.data.current?.type === 'product' && <ShoppingBagIcon className="h-5 w-5" />}
                                {activeDragItem.data.current?.type === 'author' && <UserCircleIcon className="h-5 w-5" />}
                            </div>
                            <span className="font-medium">
                                {activeDragItem.data.current?.type === 'text' && 'Text'}
                                {activeDragItem.data.current?.type === 'image' && 'Obrázek'}
                                {activeDragItem.data.current?.type === 'wrap' && 'Text a obrázek'}
                                {activeDragItem.data.current?.type === 'table' && 'Tabulka'}
                                {activeDragItem.data.current?.type === 'banner' && 'Banner'}
                                {activeDragItem.data.current?.type === 'product' && 'Produkt'}
                                {activeDragItem.data.current?.type === 'author' && 'Autor'}
                            </span>
                        </div>
                    ) : null}
                </DragOverlay>

                {/* Embed Code Modal */}
                {showEmbedModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Publikovat widget</h2>
                                <button onClick={() => setShowEmbedModal(false)} className="text-gray-400 hover:text-gray-500 cursor-pointer">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Vložte tento kód do vašich stránek tam, kde chcete zobrazit článek. <br />
                            </p>

                            <div className="relative">
                                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-all">
                                    {generateEmbedCode()}
                                </pre>
                                <button
                                    onClick={copyEmbedCode}
                                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 transition cursor-pointer"
                                    title="Zkopírovat"
                                >
                                    <ClipboardDocumentIcon className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 mt-2">
                                <em>Před zkopírováním kódu nezapomeňte uložit změny.</em>
                            </p>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowEmbedModal(false)}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                                >
                                    Zavřít
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DndContext>
    );
}
