'use client';

import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { XMarkIcon } from '@heroicons/react/24/solid';

function SortableProductItem({ product, onRemove, buttonText, buttonColor }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group relative bg-white rounded-2xl border border-gray-200/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 p-5 flex flex-col h-full cursor-grab active:cursor-grabbing"
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(product);
                }}
                className="absolute top-2 right-2 p-1.5 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Odebrat z výběru"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <XMarkIcon className="h-4 w-4" />
            </button>

            <div className="h-[180px] flex items-center justify-center mb-4">
                {product.imgUrl ? (
                    <img
                        src={product.imgUrl}
                        alt={product.productName}
                        className="max-w-full max-h-full object-contain pointer-events-none transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs bg-gray-50 rounded-lg">
                        Bez obrázku
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col min-h-0 pointer-events-none text-center">
                <h3 className="text-[15px] font-semibold text-gray-700 line-clamp-2 mb-3 min-h-[44px] leading-relaxed" title={product.productName}>
                    {product.productName}
                </h3>

                <div className="mt-auto flex flex-col items-center w-full">
                    <span className="text-[22px] font-extrabold text-emerald-600 tracking-tight mb-4">
                        {product.priceVat} Kč
                    </span>

                    <span
                        className="w-full py-3 px-6 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-90 hover:-translate-y-px flex items-center justify-center"
                        style={{ backgroundColor: buttonColor }}
                    >
                        {buttonText}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function HeurekaPreview({
    selectedProductDetails,
    onRemoveProduct,
    layout,
    gridColumns,
    buttonText,
    buttonColor
}) {
    return (
        <div className="w-full max-w-5xl mx-auto">
            {selectedProductDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                    <p>Zatím žádné vybrané produkty</p>
                    <p className="text-sm">Vyberte produkty v levém panelu</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
                    <SortableContext items={selectedProductDetails.map(p => p.id)} strategy={rectSortingStrategy}>
                        <div
                            className={layout === 'carousel'
                                ? "flex gap-6 overflow-x-auto pb-6 pt-2 snap-x"
                                : "grid gap-6"
                            }
                            style={layout === 'grid' ? {
                                gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
                            } : {}}
                        >
                            {selectedProductDetails.map((product) => (
                                <div
                                    key={product.id}
                                    className={layout === 'carousel' ? "min-w-[220px] max-w-[220px] snap-center" : ""}
                                >
                                    <SortableProductItem
                                        product={product}
                                        onRemove={onRemoveProduct}
                                        buttonText={buttonText}
                                        buttonColor={buttonColor}
                                    />
                                </div>
                            ))}
                        </div>
                    </SortableContext>
                </div>
            )}
        </div>
    );
}
