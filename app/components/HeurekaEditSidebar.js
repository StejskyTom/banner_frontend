'use client';

import { useState } from 'react';
import {
    MagnifyingGlassIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid';
import RangeSlider from './RangeSlider';

export default function HeurekaEditSidebar({
    activeTab,
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    handleSearch,
    applyFilters,
    loading,
    selectedProducts,
    toggleProductSelection,
    page,
    setPage,
    totalPages,
    layout,
    setLayout,
    gridColumns,
    setGridColumns,
    mobileGridColumns,
    setMobileGridColumns,
    buttonColor,
    setButtonColor,
    buttonText,
    setButtonText
}) {
    if (!activeTab) return null;

    return (
        <div className="w-96 bg-gray-900 border-r border-gray-800 flex flex-col h-full shrink-0 z-10 shadow-xl overflow-hidden text-gray-300">
            {activeTab === 'content' && (
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-800">
                        <h2 className="text-lg font-semibold text-white mb-4">Výběr produktů</h2>

                        {/* Search */}
                        <div className="relative mb-3">
                            <input
                                type="text"
                                placeholder="Hledat produkt..."
                                value={searchTerm}
                                onChange={handleSearch}
                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-visualy-accent-4/20 focus:border-visualy-accent-4 transition-all text-white placeholder-gray-500"
                            />
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute left-3 top-2.5" />
                        </div>

                        {/* Category Filter */}
                        <div className="mb-3">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-visualy-accent-4/20 focus:border-visualy-accent-4 transition-all text-sm text-white"
                            >
                                <option value="all">Všechny kategorie</option>
                                {categories.map((cat, index) => (
                                    <option key={`${cat.id}-${index}`} value={cat.name}>{cat.name} ({cat.productCount})</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={applyFilters}
                            className="w-full py-2 bg-visualy-accent-4 text-white rounded-lg hover:bg-visualy-accent-4/90 transition-colors font-medium text-sm shadow-sm"
                        >
                            Filtrovat
                        </button>
                    </div>

                    {/* Product List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-visualy-accent-4"></div>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Žádné produkty nenalezeny
                            </div>
                        ) : (
                            products.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => toggleProductSelection(product)}
                                    className={`
                                        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all group relative
                                        ${selectedProducts.has(product.id)
                                            ? 'bg-visualy-accent-4/10 border-visualy-accent-4/50 ring-1 ring-visualy-accent-4/30'
                                            : 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    <div className="w-12 h-12 shrink-0 bg-white rounded border border-gray-200 p-1 flex items-center justify-center">
                                        {product.imgUrl ? (
                                            <img src={product.imgUrl} alt="" className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 rounded" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-white truncate pr-6" title={product.productName}>
                                            {product.productName}
                                        </h3>
                                        <p className="text-xs text-green-400 font-bold mt-0.5">
                                            {product.priceVat} Kč
                                        </p>
                                    </div>
                                    {selectedProducts.has(product.id) && (
                                        <div className="absolute top-3 right-3 text-visualy-accent-4">
                                            <CheckCircleIcon className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-800 bg-gray-900 flex items-center justify-between">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-all text-gray-400"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-400">
                            Strana {page} z {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent transition-all text-gray-400"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="flex flex-col h-full overflow-y-auto">
                    <div className="p-6 space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-1">Nastavení vzhledu</h2>
                            <p className="text-sm text-gray-400 mb-6">Upravte zobrazení produktů</p>

                            {/* Layout Selection */}
                            <div className="space-y-4 mb-8">
                                <label className="text-sm font-medium text-gray-300 block">Rozložení</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setLayout('carousel')}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${layout === 'carousel'
                                            ? 'border-visualy-accent-4 bg-green-900/20 ring-1 ring-visualy-accent-4/20'
                                            : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                                            }`}
                                    >
                                        <div className="font-medium text-white mb-1">Carousel</div>
                                        <div className="text-xs text-gray-400">Produkty v posuvném pásu</div>
                                    </button>
                                    <button
                                        onClick={() => setLayout('grid')}
                                        className={`p-3 rounded-xl border-2 text-left transition-all ${layout === 'grid'
                                            ? 'border-visualy-accent-4 bg-green-900/20 ring-1 ring-visualy-accent-4/20'
                                            : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                                            }`}
                                    >
                                        <div className="font-medium text-white mb-1">Mřížka</div>
                                        <div className="text-xs text-gray-400">Statická mřížka produktů</div>
                                    </button>
                                </div>
                            </div>

                            {/* Grid Columns */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-300">Sloupce (Desktop)</label>
                                        <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">{gridColumns}</span>
                                    </div>
                                    <RangeSlider
                                        min={1}
                                        max={6}
                                        step={1}
                                        value={gridColumns}
                                        onChange={(e) => setGridColumns(parseInt(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-300">Sloupce (Mobil)</label>
                                        <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">{mobileGridColumns}</span>
                                    </div>
                                    <RangeSlider
                                        min={1}
                                        max={3}
                                        step={1}
                                        value={mobileGridColumns}
                                        onChange={(e) => setMobileGridColumns(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-gray-800 my-8" />

                            {/* Button Settings */}
                            <h3 className="text-base font-medium text-white mb-4">Tlačítko</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-2">Text tlačítka</label>
                                    <input
                                        type="text"
                                        value={buttonText}
                                        onChange={(e) => setButtonText(e.target.value)}
                                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-visualy-accent-4/20 focus:border-visualy-accent-4 transition-all text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-300 block mb-2">Barva tlačítka</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={buttonColor}
                                            onChange={(e) => setButtonColor(e.target.value)}
                                            className="h-10 w-10 rounded-lg border border-gray-700 cursor-pointer p-1 bg-gray-800"
                                        />
                                        <input
                                            type="text"
                                            value={buttonColor}
                                            onChange={(e) => setButtonColor(e.target.value)}
                                            className="flex-1 p-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-visualy-accent-4/20 focus:border-visualy-accent-4 transition-all uppercase font-mono text-sm text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
