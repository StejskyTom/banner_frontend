'use client';

import { useState } from 'react';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
    KeyboardSensor
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrashIcon, Bars3Icon, ChevronDownIcon, ChevronUpIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';

const getContrastYIQ = (hexcolor) => {
    if (!hexcolor) return '#000000';

    // Remove hash
    let hex = hexcolor.toString().replace('#', '');

    // Handle 3-char shorthand
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Attempt to handle non-hex colors or incomplete hex by defaulting to black
    if (hex.length !== 6) return '#000000';

    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';

    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
};

const ColorInput = ({ label, value, onChange }) => {
    const textColor = getContrastYIQ(value);

    return (
        <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block">{label}</label>
            <div className="relative group">
                <div className="relative flex items-center h-10 w-full rounded-md border border-gray-600 shadow-sm overflow-hidden ring-1 ring-white/5 transition-all focus-within:ring-2 focus-within:ring-indigo-500">
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-full text-left text-sm font-bold uppercase font-mono border-none focus:outline-none pl-3 pr-10"
                        style={{ backgroundColor: value || '#ffffff', color: textColor }}
                    />

                    {/* Color Picker Trigger (Right Side) */}
                    <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center cursor-pointer border-l border-black/10 hover:bg-black/20 bg-black/5">
                        <SwatchIcon className="h-5 w-5 opacity-70" style={{ color: textColor }} />
                        <input
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

function SortableQuestionItem({ id, question, onUpdate, onRemove }) {

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div ref={setNodeRef} style={style} className="bg-gray-800 rounded-lg border border-gray-700 mb-3 overflow-hidden">
            <div className="flex items-center p-3 gap-3 bg-gray-800">
                <div {...attributes} {...listeners} className="cursor-move text-gray-500 hover:text-gray-300 touch-none">
                    <Bars3Icon className="h-5 w-5" />
                </div>
                <div
                    className="flex-1 font-medium text-sm text-white truncate cursor-pointer select-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {question.question || 'Nová otázka'}
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-500 hover:text-gray-300 transition"
                >
                    {isOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                </button>
                <button
                    onClick={onRemove}
                    className="text-gray-500 hover:text-red-500 transition"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>

            {isOpen && (
                <div className="p-3 border-t border-gray-700 bg-gray-900/50 space-y-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Otázka</label>
                        <input
                            type="text"
                            value={question.question}
                            onChange={(e) => onUpdate({ ...question, question: e.target.value })}
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Např. Jaká je otevírací doba?"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Odpověď</label>
                        <textarea
                            value={question.answer}
                            onChange={(e) => onUpdate({ ...question, answer: e.target.value })}
                            rows={3}
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                            placeholder="Např. Otevřeno máme každý všední den..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FaqEditSidebar({ widget, setWidget, activeTab }) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = widget.questions.findIndex((q) => q.id === active.id);
        const newIndex = widget.questions.findIndex((q) => q.id === over.id);

        setWidget({
            ...widget,
            questions: arrayMove(widget.questions, oldIndex, newIndex),
        });
    };

    const handleUpdateQuestion = (id, updatedQuestion) => {
        setWidget({
            ...widget,
            questions: widget.questions.map(q => q.id === id ? updatedQuestion : q)
        });
    };

    const handleRemoveQuestion = (id) => {
        setWidget({
            ...widget,
            questions: widget.questions.filter(q => q.id !== id)
        });
    };

    const handleAddQuestion = () => {
        const newQuestion = {
            id: crypto.randomUUID(),
            question: '',
            answer: ''
        };
        setWidget({
            ...widget,
            questions: [...(widget.questions || []), newQuestion]
        });
    };

    if (!activeTab) return null;

    return (
        <aside className="dark w-80 bg-gray-900 border-r border-gray-800 text-white h-full flex flex-col transition-all duration-300 shrink-0">
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Název widgetu</label>
                            <input
                                value={widget.name || ''}
                                onChange={(e) => setWidget({ ...widget, name: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                            />
                        </div>

                        <hr className="border-gray-800" />

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-medium text-gray-400">Otázky</label>
                            </div>

                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={(widget.questions || []).map(q => q.id)} strategy={verticalListSortingStrategy}>
                                    <div>
                                        {(widget.questions || []).map((q) => (
                                            <SortableQuestionItem
                                                key={q.id}
                                                id={q.id}
                                                question={q}
                                                onUpdate={(updated) => handleUpdateQuestion(q.id, updated)}
                                                onRemove={() => handleRemoveQuestion(q.id)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            <button
                                onClick={handleAddQuestion}
                                className="w-full py-3 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/50 transition flex items-center justify-center gap-2 group mt-2"
                            >
                                <PlusIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                <span className="font-medium">Přidat otázku</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-medium text-gray-400 mb-3 block">Font</label>
                            <select
                                value={widget.font || "sans-serif"}
                                onChange={(e) => setWidget({ ...widget, font: e.target.value })}
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="sans-serif">Sans Serif</option>
                                <option value="serif">Serif</option>
                                <option value="monospace">Monospace</option>
                            </select>
                        </div>

                        <hr className="border-gray-800" />

                        <div className="grid grid-cols-2 gap-3">
                            <ColorInput
                                label="Barva otázky"
                                value={widget.questionColor || '#111827'}
                                onChange={(val) => setWidget({ ...widget, questionColor: val })}
                            />

                            <ColorInput
                                label="Barva odpovědi"
                                value={widget.answerColor || '#6B7280'}
                                onChange={(val) => setWidget({ ...widget, answerColor: val })}
                            />

                            <ColorInput
                                label="Barva při najetí"
                                value={widget.hoverColor || '#4F46E5'}
                                onChange={(val) => setWidget({ ...widget, hoverColor: val })}
                            />

                            <ColorInput
                                label="Barva pozadí"
                                value={widget.backgroundColor || '#ffffff'}
                                onChange={(val) => setWidget({ ...widget, backgroundColor: val })}
                            />
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
