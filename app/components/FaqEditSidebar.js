'use client';

import { useState } from 'react';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
    KeyboardSensor
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrashIcon, Bars3Icon, ChevronDownIcon, ChevronUpIcon, BoldIcon, ItalicIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import RangeSlider from './RangeSlider';
import ColorInput from './ColorInput';
import Toggle from './Toggle';

const CollapsibleSection = ({ title, children, isOpen, onToggle }) => {
    return (
        <div className={`group rounded-xl transition-all duration-300 border ${isOpen ? 'bg-gray-800 border-gray-600 shadow-lg my-2' : 'border-transparent'}`}>
            <div
                onClick={onToggle}
                className={`flex items-center justify-between cursor-pointer list-none text-xs font-bold uppercase px-3 py-3 select-none leading-none tracking-wider rounded-xl transition-colors ${isOpen ? 'text-white bg-gray-700/50 rounded-b-none' : 'text-gray-300 hover:text-white hover:bg-gray-800/30'}`}
            >
                <span className="translate-y-[1px]">{title}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="space-y-4 px-3 py-4 border-t border-gray-700/30">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ToolButton = ({ active, onClick, children, title }) => (
    <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={`p-2 rounded-md transition-all font-medium text-sm border flex items-center justify-center h-8 min-w-[32px] flex-1
            ${active
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 hover:border-gray-600'
            }`}
        title={title}
    >
        {children}
    </button>
);

const QuestionStyleControls = ({ widget, setWidget, prefix = 'question' }) => {
    const tag = widget[`${prefix}Tag`] || 'h3';
    const color = widget[`${prefix}Color`] || '#111827';
    const size = widget[`${prefix}Size`] || '18px';
    const font = widget[`${prefix}Font`] || 'sans-serif';
    const isBold = widget[`${prefix}Bold`] ?? true;
    const isItalic = widget[`${prefix}Italic`] || false;
    const align = widget[`${prefix}Align`] || 'left';
    const marginBottom = widget[`${prefix}MarginBottom`] ?? 8;

    const handleChange = (key, value) => {
        setWidget({ ...widget, [`${prefix}${key}`]: value });
    };

    return (
        <div className="space-y-3">
            {/* Tag & Style Buttons */}
            <div className="flex flex-wrap gap-1 items-center mb-3">
                <ToolButton onClick={() => handleChange('Tag', 'p')} active={tag === 'p'} title="Normal Text">T</ToolButton>
                <ToolButton onClick={() => handleChange('Tag', 'h1')} active={tag === 'h1'} title="H1">H1</ToolButton>
                <ToolButton onClick={() => handleChange('Tag', 'h2')} active={tag === 'h2'} title="H2">H2</ToolButton>
                <ToolButton onClick={() => handleChange('Tag', 'h3')} active={tag === 'h3'} title="H3">H3</ToolButton>

                <div className="w-px h-8 bg-gray-700 mx-1" />

                <ToolButton onClick={() => handleChange('Bold', !isBold)} active={isBold} title="Tučně">
                    <BoldIcon className="w-4 h-4" />
                </ToolButton>
                <ToolButton onClick={() => handleChange('Italic', !isItalic)} active={isItalic} title="Kurzíva">
                    <ItalicIcon className="w-4 h-4" />
                </ToolButton>
            </div>

            {/* Grid Inputs */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="relative">
                    <ColorInput
                        value={color}
                        onChange={(val) => handleChange('Color', val)}
                    />
                </div>
                <select
                    className="h-10 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                    onChange={(e) => handleChange('Size', e.target.value)}
                    value={size}
                >
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                    <option value="32px">32px</option>
                </select>

                <div>
                    <select
                        className="h-10 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                        onChange={(e) => handleChange('Font', e.target.value)}
                        value={font}
                    >
                        <option value="sans-serif">Sans Serif</option>
                        <option value="system-ui">System UI</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Courier New, monospace">Courier</option>
                    </select>
                </div>
                <div>
                    <select
                        className="h-10 w-full bg-gray-800 border border-gray-700 text-white text-sm px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                        onChange={(e) => handleChange('Align', e.target.value)}
                        value={align}
                    >
                        <option value="left">Vlevo</option>
                        <option value="center">Na střed</option>
                        <option value="right">Vpravo</option>
                    </select>
                </div>
            </div>

            {/* Margin Slider */}
            <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                    Spodní odsazení ({marginBottom}px)
                </label>
                <RangeSlider
                    min={0}
                    max={48}
                    step={4}
                    value={marginBottom}
                    onChange={(e) => handleChange('MarginBottom', parseInt(e.target.value))}
                />
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
    const [openSections, setOpenSections] = useState({});
    const [autoClose, setAutoClose] = useState(true);

    const toggleSection = (id) => {
        setOpenSections(prev => {
            const isCurrentlyOpen = !!prev[id];
            if (autoClose) {
                return isCurrentlyOpen ? {} : { [id]: true };
            } else {
                return { ...prev, [id]: !isCurrentlyOpen };
            }
        });
    };

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
            {activeTab === 'content' && (
                <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 [scrollbar-width:thin] [scrollbar-color:rgb(55,65,81)_transparent]">
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
                </div>
            )}

            {activeTab === 'settings' && (
                <>
                    <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
                        <div>
                            <CollapsibleSection
                                title="Nastavení otázky"
                                isOpen={!!openSections['question']}
                                onToggle={() => toggleSection('question')}
                            >
                                <QuestionStyleControls
                                    widget={widget}
                                    setWidget={setWidget}
                                    prefix="question"
                                />
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection
                                title="Nastavení odpovědi"
                                isOpen={!!openSections['answer']}
                                onToggle={() => toggleSection('answer')}
                            >
                                <QuestionStyleControls
                                    widget={widget}
                                    setWidget={setWidget}
                                    prefix="answer"
                                />
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection
                                title="Nastavení šipky"
                                isOpen={!!openSections['arrow']}
                                onToggle={() => toggleSection('arrow')}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-400 mb-2 block">Pozice šipky</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => setWidget({ ...widget, arrowPosition: 'left' })}
                                                className={`p-2 rounded-lg border text-xs transition-all ${widget.arrowPosition === 'left'
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                Vlevo
                                            </button>
                                            <button
                                                onClick={() => setWidget({ ...widget, arrowPosition: 'after' })}
                                                className={`p-2 rounded-lg border text-xs transition-all ${(!widget.arrowPosition || widget.arrowPosition === 'after')
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                Za textem
                                            </button>
                                            <button
                                                onClick={() => setWidget({ ...widget, arrowPosition: 'right' })}
                                                className={`p-2 rounded-lg border text-xs transition-all ${widget.arrowPosition === 'right'
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                Vpravo
                                            </button>
                                        </div>
                                    </div>

                                    <ColorInput
                                        label="Barva šipky"
                                        value={widget.arrowColor || '#6B7280'}
                                        onChange={(val) => setWidget({ ...widget, arrowColor: val })}
                                    />

                                    <div>
                                        <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                                            Velikost šipky ({widget.arrowSize || 24}px)
                                        </label>
                                        <RangeSlider
                                            min={16}
                                            max={48}
                                            step={2}
                                            value={widget.arrowSize || 24}
                                            onChange={(e) => setWidget({ ...widget, arrowSize: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection
                                title="Nastavení rámečku"
                                isOpen={!!openSections['border']}
                                onToggle={() => toggleSection('border')}
                            >
                                <div className="space-y-4">
                                    <Toggle
                                        checked={widget.borderEnabled || false}
                                        onChange={(val) => setWidget({ ...widget, borderEnabled: val })}
                                        label="Zobrazit rámeček"
                                    />
                                    {widget.borderEnabled && (
                                        <>
                                            <ColorInput
                                                label="Barva rámečku"
                                                value={widget.borderColor || '#e5e7eb'}
                                                onChange={(val) => setWidget({ ...widget, borderColor: val })}
                                            />
                                            <div>
                                                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                                                    Šířka rámečku ({widget.borderWidth || 1}px)
                                                </label>
                                                <RangeSlider
                                                    min={1}
                                                    max={10}
                                                    step={1}
                                                    value={widget.borderWidth || 1}
                                                    onChange={(e) => setWidget({ ...widget, borderWidth: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection
                                title="Nastavení oddělovače"
                                isOpen={!!openSections['divider']}
                                onToggle={() => toggleSection('divider')}
                            >
                                <div className="space-y-4">
                                    <Toggle
                                        checked={widget.dividerEnabled ?? true}
                                        onChange={(val) => setWidget({ ...widget, dividerEnabled: val })}
                                        label="Zobrazit oddělovač"
                                    />
                                    {(widget.dividerEnabled ?? true) && (
                                        <>
                                            <ColorInput
                                                label="Barva oddělovače"
                                                value={widget.dividerColor || '#e5e7eb'}
                                                onChange={(val) => setWidget({ ...widget, dividerColor: val })}
                                            />
                                            <div>
                                                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                                                    Šířka oddělovače ({widget.dividerWidth || 100}%)
                                                </label>
                                                <RangeSlider
                                                    min={10}
                                                    max={100}
                                                    step={5}
                                                    value={widget.dividerWidth || 100}
                                                    onChange={(e) => setWidget({ ...widget, dividerWidth: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                                                    Výška oddělovače ({widget.dividerHeight || 1}px)
                                                </label>
                                                <RangeSlider
                                                    min={1}
                                                    max={10}
                                                    step={1}
                                                    value={widget.dividerHeight || 1}
                                                    onChange={(e) => setWidget({ ...widget, dividerHeight: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                                                    Odsazení oddělovače ({widget.dividerMargin || 8}px)
                                                </label>
                                                <RangeSlider
                                                    min={0}
                                                    max={50}
                                                    step={2}
                                                    value={widget.dividerMargin ?? 8}
                                                    onChange={(e) => setWidget({ ...widget, dividerMargin: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['solid', 'dashed', 'dotted'].map((style) => (
                                                    <button
                                                        key={style}
                                                        onClick={() => setWidget({ ...widget, dividerStyle: style })}
                                                        className={`p-2 rounded text-xs font-medium capitalize border ${widget.dividerStyle === style || (!widget.dividerStyle && style === 'solid')
                                                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                                                            }`}
                                                    >
                                                        {style}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CollapsibleSection>

                            <hr className="border-0 h-[2px] bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2" />

                            <CollapsibleSection
                                title="Další nastavení"
                                isOpen={!!openSections['other']}
                                onToggle={() => toggleSection('other')}
                            >
                                <div className="space-y-4">
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
                            </CollapsibleSection>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-800 bg-gray-900/95 backdrop-blur shrink-0">
                        <Toggle
                            checked={autoClose}
                            onChange={setAutoClose}
                            label="Zavírat neaktivní položky"
                        />
                    </div>
                </>
            )}

        </aside >
    );
}
