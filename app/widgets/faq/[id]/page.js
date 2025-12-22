'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from "../../../components/ToastProvider";
import {
    ChevronLeftIcon,
    PlusIcon,
    TrashIcon,
    Bars3Icon,
    CodeBracketIcon,
    ClipboardDocumentIcon,
    XMarkIcon,
    CheckIcon,
    PencilSquareIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Pure UI Component for the Question Item
function QuestionItem({ question, onUpdate, onRemove, dragHandleProps, style, className }) {
    return (
        <div
            style={style}
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm group ${className}`}
        >
            <div className="flex items-start gap-3">
                <div
                    {...dragHandleProps}
                    className="mt-2 text-gray-400 cursor-move hover:text-gray-600 dark:hover:text-gray-300 touch-none"
                >
                    <Bars3Icon className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-3">
                    <input
                        type="text"
                        value={question.question}
                        onChange={(e) => onUpdate && onUpdate({ ...question, question: e.target.value })}
                        placeholder="Otázka"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-transparent text-gray-900 dark:text-white font-medium"
                    />
                    <textarea
                        value={question.answer}
                        onChange={(e) => onUpdate && onUpdate({ ...question, answer: e.target.value })}
                        placeholder="Odpověď"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-transparent text-gray-900 dark:text-white text-sm"
                    />
                </div>

                <button
                    onClick={onRemove}
                    className="mt-2 text-gray-400 hover:text-red-500 transition cursor-pointer"
                    title="Odstranit otázku"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}

// Sortable Wrapper
function SortableQuestionItem({ question, onUpdate, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-3">
            <QuestionItem
                question={question}
                onUpdate={(updated) => onUpdate(question.id, updated)}
                onRemove={() => onRemove(question.id)}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}

export default function FaqWidgetDetailPage() {
    const { id } = useParams();
    const [widget, setWidget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [activeId, setActiveId] = useState(null); // For DragOverlay
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    const showNotification = useToast();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (id) {
            fetchWidget();
        }
    }, [id]);

    const fetchWidget = async () => {
        try {
            const res = await authorizedFetch(`/faq-widgets/${id}`);
            if (res?.ok) {
                const data = await res.json();
                setWidget(data);
                // Ensure every question has an ID
                const questionsWithIds = (data.questions || []).map(q => ({
                    ...q,
                    id: q.id || crypto.randomUUID()
                }));
                setQuestions(questionsWithIds);
                setEditNameValue(data.name);
            } else {
                showNotification('Nepodařilo se načíst widget', 'error');
            }
        } catch (error) {
            showNotification('Chyba při načítání widgetu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Clean IDs before saving if backend doesn't expect them, or keep them if it's fine.
            // Keeping them is better for consistency, but let's check if backend Entity allows extra fields in JSON.
            // Doctrine JSON type usually allows anything.

            const res = await authorizedFetch(`/faq-widgets/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    questions: questions,
                    name: editNameValue
                })
            });

            if (res?.ok) {
                const updatedWidget = await res.json();
                setWidget(updatedWidget);
                setIsEditingName(false);
                showNotification('Změny uloženy', 'success');
            } else {
                showNotification('Nepodařilo se uložit změny', 'error');
            }
        } catch (error) {
            showNotification('Chyba při ukládání', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { id: crypto.randomUUID(), question: '', answer: '' }]);
    };

    const handleUpdateQuestion = (id, updatedQuestion) => {
        setQuestions(questions.map(q => q.id === id ? updatedQuestion : q));
    };

    const handleRemoveQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setQuestions((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const generateEmbedCode = () => {
        const embedUrl = `${process.env.NEXT_PUBLIC_API_URL}/faq-widgets/${id}/embed.js`;
        return `<script src="${embedUrl}" defer></script>`;
    };

    const copyEmbedCode = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        showNotification('Kód zkopírován do schránky', 'success');
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    if (loading) return <div className="p-8 text-center">Načítám...</div>;
    if (!widget) return <div className="p-8 text-center">Widget nenalezen</div>;

    const activeQuestion = activeId ? questions.find(q => q.id === activeId) : null;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/widgets/faq"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </Link>

                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-indigo-500 focus:outline-none"
                                autoFocus
                            />
                            <button
                                onClick={handleSave}
                                className="p-1 text-green-600 hover:text-green-700 transition cursor-pointer"
                                title="Uložit název"
                            >
                                <CheckIcon className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingName(false);
                                    setEditNameValue(widget.name);
                                }}
                                className="p-1 text-red-600 hover:text-red-700 transition cursor-pointer"
                                title="Zrušit"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{widget.name}</h1>
                            <button
                                onClick={() => setIsEditingName(true)}
                                className="opacity-0 group-hover:opacity-100 transition p-1 text-gray-400 hover:text-indigo-600 cursor-pointer"
                                title="Upravit název"
                            >
                                <PencilSquareIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowEmbedModal(true)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer"
                    >
                        <CodeBracketIcon className="h-5 w-5" />
                        Embed kód
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                        {saving ? 'Ukládám...' : 'Uložit změny'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Column */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Otázky a odpovědi</h2>
                        <button
                            onClick={handleAddQuestion}
                            className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-1 cursor-pointer"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Přidat otázku
                        </button>
                    </div>

                    <div className="space-y-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                        >
                            <SortableContext
                                items={questions.map(q => q.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {questions.map((q) => (
                                    <SortableQuestionItem
                                        key={q.id}
                                        question={q}
                                        onUpdate={handleUpdateQuestion}
                                        onRemove={handleRemoveQuestion}
                                    />
                                ))}
                            </SortableContext>

                            <DragOverlay dropAnimation={dropAnimation}>
                                {activeQuestion ? (
                                    <QuestionItem
                                        question={activeQuestion}
                                        className="shadow-xl ring-2 ring-indigo-500 cursor-grabbing"
                                    />
                                ) : null}
                            </DragOverlay>
                        </DndContext>

                        {questions.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <p className="text-gray-500 dark:text-gray-400">Zatím žádné otázky.</p>
                                <button
                                    onClick={handleAddQuestion}
                                    className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                                >
                                    Přidat první otázku
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Column */}
                <div className="lg:sticky lg:top-8 h-fit">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Náhled</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="space-y-2">
                            {questions.map((q) => (
                                <div key={q.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-2 last:pb-0">
                                    <details className="group">
                                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none py-2 text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                            <span>{q.question || 'Nová otázka'}</span>
                                            <span className="transition group-open:rotate-180">
                                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                            </span>
                                        </summary>
                                        <div className="text-gray-500 dark:text-gray-400 mt-2 pb-2 text-sm leading-relaxed">
                                            {q.answer || 'Zde bude odpověď...'}
                                        </div>
                                    </details>
                                </div>
                            ))}
                            {questions.length === 0 && (
                                <p className="text-gray-400 text-center py-4 italic">Náhled se zobrazí po přidání otázek.</p>
                            )}
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-400 text-center">
                        Poznámka: Vzhled na vašem webu se může mírně lišit v závislosti na vašem CSS.
                    </p>
                </div>
            </div>

            {/* Embed Code Modal */}
            {showEmbedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Embed kód</h2>
                            <button onClick={() => setShowEmbedModal(false)} className="text-gray-400 hover:text-gray-500 cursor-pointer">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Vložte tento kód do vašich stránek tam, kde chcete zobrazit FAQ.
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
    );
}
