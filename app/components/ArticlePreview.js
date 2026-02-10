'use client';

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import PreviewBlock from './article/PreviewBlock';

const isBlockOrChildSelected = (block, selectedId) => {
    if (!selectedId) return false;
    if (block.id === selectedId) return true;
    if (block.type === 'layout' && block.columns) {
        return block.columns.some(col =>
            (col.blocks || []).some(child => child.id === selectedId)
        );
    }
    return false;
};

export default function ArticlePreview({ blocks, selectedBlockId, onSelectBlock, onUpdateBlock, onFormatChange, onDeleteBlock }) {
    const { setNodeRef } = useDroppable({
        id: 'preview-area',
    });

    const { setNodeRef: setAppendZoneRef } = useDroppable({
        id: 'append-zone',
    });

    const { active, over } = useDndContext();
    const isPaletteItem = active?.data?.current?.isPaletteItem;
    // Show append indicator when over container OR over the dedicated append zone
    const showAppendIndicator = isPaletteItem && (over?.id === 'preview-area' || over?.id === 'append-zone');

    return (
        <div
            ref={setNodeRef}
            className="w-full max-w-3xl mx-auto bg-white min-h-[800px] shadow-sm rounded-xl p-12 relative flex flex-col"
            onClick={() => onSelectBlock(null)}
        >
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((block) => (
                    <PreviewBlock
                        key={block.id}
                        block={block}
                        isSelected={isBlockOrChildSelected(block, selectedBlockId)}
                        selectedBlockId={selectedBlockId}
                        onClick={() => onSelectBlock(block.id)}
                        onSelectBlock={onSelectBlock}
                        onChange={onUpdateBlock}
                        onFormatChange={onFormatChange}
                        onDelete={onDeleteBlock}
                    />
                ))}
            </SortableContext>

            {/* Append Indicator */}
            {showAppendIndicator && (
                <div className="w-full h-1 bg-visualy-accent-4 rounded-full mt-2 transition-all shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            )}

            {/* Dedicated Append Zone - fills remaining space to make dropping easier */}
            <div ref={setAppendZoneRef} className="flex-1 min-h-[100px] w-full mt-2" />

            {blocks.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                        <p>Zatím žádný obsah</p>
                        <p className="text-sm">Přetáhněte bloky z levého panelu</p>
                    </div>
                </div>
            )}
        </div>
    );
}
