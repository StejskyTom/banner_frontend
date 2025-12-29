'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from "../../../components/ToastProvider";
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, CheckIcon, Cog6ToothIcon, CodeBracketIcon, ClipboardDocumentIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/solid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Loader from '../../../components/Loader';

const ITEMS_PER_PAGE = 30;

function SortableProductItem({ product, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700 shadow-sm cursor-move touch-none"
    >
      {product.imgUrl && (
        <img
          src={product.imgUrl}
          alt={product.productName}
          className="w-12 h-12 object-contain rounded bg-white pointer-events-none"
        />
      )}
      <div className="flex-1 min-w-0 pointer-events-none">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={product.productName}>
          {product.productName}
        </h4>
        <p className="text-xs text-green-600 font-bold">{product.priceVat} Kč</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent drag start
          onRemove(product);
        }}
        className="text-gray-400 hover:text-red-500 transition cursor-pointer"
        title="Odebrat z výběru"
        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function HeurekaFeedDetailPage() {
  const { feedId } = useParams();
  const [feed, setFeed] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectedProductDetails, setSelectedProductDetails] = useState([]);
  const [showSelected, setShowSelected] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [sortBy, setSortBy] = useState('name_asc');
  const [saving, setSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');

  // Settings Modal State
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [layout, setLayout] = useState('carousel');
  const [gridColumns, setGridColumns] = useState(3);
  const [mobileGridColumns, setMobileGridColumns] = useState(1);
  const [buttonColor, setButtonColor] = useState('#2563eb');
  const [buttonText, setButtonText] = useState('Koupit');
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const showNotification = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (feedId) {
      fetchFeedDetails();
      fetchCategories();
    }
  }, [feedId]);

  useEffect(() => {
    if (feedId) {
      fetchProducts();
    }
  }, [feedId, page, itemsPerPage, sortBy]);

  useEffect(() => {
    if (feed) {
      setLayout(feed.layout || 'carousel');
      if (feed.layoutOptions) {
        setGridColumns(feed.layoutOptions.gridColumns || 3);
        setMobileGridColumns(feed.layoutOptions.mobileGridColumns || 1);
        setButtonColor(feed.layoutOptions.buttonColor || '#2563eb');
        setButtonText(feed.layoutOptions.buttonText || 'Koupit');
      }
    }
  }, [feed]);

  const fetchFeedDetails = async () => {
    try {
      const res = await authorizedFetch(`/heureka/feeds/${feedId}`);
      if (res?.ok) {
        const data = await res.json();
        setFeed(data);
        setEditNameValue(data.name);
      }
    } catch (error) {
      showNotification('Chyba při načítání feedu', 'error');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      params.append('limit', itemsPerPage);
      params.append('offset', (page - 1) * itemsPerPage);
      params.append('sort', sortBy);

      const res = await authorizedFetch(`/heureka/feeds/${feedId}/products?${params}`);
      if (res?.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotalItems(data.total);

        // Load previously selected products (only once or check if needed)
        // However, we only need to load it once really.
        if (selectedProductDetails.length === 0) {
          const selectedRes = await authorizedFetch(`/heureka/feeds/${feedId}/products/selected`);
          if (selectedRes?.ok) {
            const selectedData = await selectedRes.json();
            setSelectedProducts(new Set(selectedData.map(p => p.id)));
            setSelectedProductDetails(selectedData);
          }
        }
      }
    } catch (error) {
      showNotification('Chyba při načítání produktů', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await authorizedFetch(`/heureka/feeds/${feedId}/categories`);
      if (res?.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Chyba při načítání kategorií', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const applyFilters = () => {
    if (page === 1) {
      fetchProducts();
    } else {
      setPage(1);
    }
  };

  const toggleProductSelection = (product) => {
    const productId = product.id;

    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    setSelectedProductDetails(prev => {
      const exists = prev.find(p => p.id === productId);
      if (exists) {
        return prev.filter(p => p.id !== productId);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedProductDetails((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      // Use selectedProductDetails to preserve order
      const orderedIds = selectedProductDetails.map(p => p.id);

      const saveSelectionPromise = authorizedFetch(`/heureka/feeds/${feedId}/products/selection`, {
        method: 'PUT',
        body: JSON.stringify({
          selectedProductIds: orderedIds
        })
      });

      const saveSettingsPromise = authorizedFetch(`/heureka/feeds/${feedId}`, {
        method: 'PUT',
        body: JSON.stringify({
          layout: layout,
          layoutOptions: {
            gridColumns: parseInt(gridColumns),
            mobileGridColumns: parseInt(mobileGridColumns),
            buttonColor: buttonColor,
            buttonText: buttonText
          },
          url: feed.url,
          name: feed.name
        })
      });

      const [selectionRes, settingsRes] = await Promise.all([saveSelectionPromise, saveSettingsPromise]);

      if (selectionRes?.ok && settingsRes?.ok) {
        const updatedFeed = await settingsRes.json();
        setFeed(updatedFeed);
        showNotification('Všechny změny byly uloženy', 'success');
      } else {
        showNotification('Některé změny se nepodařilo uložit', 'warning');
      }
    } catch (error) {
      showNotification('Chyba při ukládání', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateName = async () => {
    if (!editNameValue.trim()) return;

    try {
      const res = await authorizedFetch(`/heureka/feeds/${feedId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editNameValue,
          url: feed.url // Keep existing URL
        })
      });

      if (res?.ok) {
        const updatedFeed = await res.json();
        setFeed(updatedFeed);
        setIsEditingName(false);
        showNotification('Název feedu byl upraven', 'success');
      } else {
        showNotification('Nepodařilo se upravit název', 'error');
      }
    } catch (error) {
      showNotification('Chyba při úpravě názvu', 'error');
    }
  };



  const generateEmbedCode = () => {
    const embedUrl = `${process.env.NEXT_PUBLIC_API_URL}/heureka/feed/${feedId}/embed.js`;
    return `<script src="${embedUrl}" defer></script>`;
  };

  const generatePreviewUrl = () => {
    return `${process.env.NEXT_PUBLIC_API_URL}/heureka/feed/${feedId}/embed.js`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    showNotification('Kód zkopírován do schránky', 'success');
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (!feed) return <Loader />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
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
                onClick={handleUpdateName}
                className="p-1 text-green-600 hover:text-green-700 transition cursor-pointer"
                title="Uložit"
              >
                <CheckIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false);
                  setEditNameValue(feed.name);
                }}
                className="p-1 text-red-600 hover:text-red-700 transition cursor-pointer"
                title="Zrušit"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{feed.name}</h1>
              <button
                onClick={() => setIsEditingName(true)}
                className="opacity-0 group-hover:opacity-100 transition p-1 text-gray-400 hover:text-indigo-600 cursor-pointer"
                title="Upravit název"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Celkem produktů: {feed.productCount} | Vybráno: {selectedProducts.size}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmbedModal(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer"
          >
            <CodeBracketIcon className="h-5 w-5" />
            Embed kód
          </button>
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer"
          >
            <EyeIcon className="h-5 w-5" />
            Náhled
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {saving && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {saving ? 'Ukládám...' : 'Uložit změny'}
          </button>
        </div>
      </div>

      {/* Settings Section */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex justify-between items-center p-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nastavení zobrazení</h2>
          {showSettings ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {showSettings && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Typ zobrazení
                </label>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="carousel">Carousel (posuvník)</option>
                  <option value="grid">Mřížka (Grid)</option>
                  <option value="list">Seznam (List)</option>
                </select>
              </div>

              {layout === 'grid' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sloupce (Desktop)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={gridColumns}
                      onChange={(e) => setGridColumns(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sloupce (Mobil)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="3"
                      value={mobileGridColumns}
                      onChange={(e) => setMobileGridColumns(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Text tlačítka
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Koupit"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Barva tlačítka "Koupit"
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="h-10 w-20 p-1 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{buttonColor}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Embed Code Modal */}
      {
        showEmbedModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEmbedModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Embed kód</h2>
                <button onClick={() => setShowEmbedModal(false)} className="text-gray-400 hover:text-gray-500 cursor-pointer">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Vložte tento kód do vašich stránek tam, kde chcete zobrazit produkty.
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
        )
      }



      {/* Preview Modal */}
      {
        showPreviewModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPreviewModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl h-[80vh] flex flex-col transform transition-all scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Náhled widgetu</h2>
                <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-gray-500 cursor-pointer">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
                        </style>
                      </head>
                      <body>
                        <div id="heureka-widget-preview"></div>
                        <script src="${generatePreviewUrl()}"></script>
                      </body>
                    </html>
                  `}
                  className="w-full h-full border-0"
                  title="Widget Preview"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
                >
                  Zavřít
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Selected Products Section */}
      {
        selectedProductDetails.length > 0 && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 overflow-hidden">
            <button
              onClick={() => setShowSelected(!showSelected)}
              className="w-full flex justify-between items-center p-4 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition cursor-pointer"
            >
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                Vybrané produkty ({selectedProductDetails.length})
              </span>
              {showSelected ? (
                <ChevronUpIcon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              )}
            </button>

            {showSelected && (
              <div className="p-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedProductDetails.map(p => p.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
                      {selectedProductDetails.map(product => (
                        <SortableProductItem
                          key={product.id}
                          product={product}
                          onRemove={toggleProductSelection}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        )
      }

      {/* Filtry */}
      <div className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hledat</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Název produktu..."
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Všechny kategorie</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.productCount})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
            >
              Filtrovat
            </button>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        {/* Left: Sort */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Řazení:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-[180px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="name_asc">Název (A-Z)</option>
            <option value="name_desc">Název (Z-A)</option>
            <option value="price_asc">Cena (nejlevnější)</option>
            <option value="price_desc">Cena (nejdražší)</option>
          </select>
        </div>

        {/* Center: Stats */}
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Zobrazeno {Math.min((page - 1) * itemsPerPage + 1, totalItems)} - {Math.min(page * itemsPerPage, totalItems)} z {totalItems} produktů
        </div>

        {/* Right: Items per page */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Na stránku:</span>
          <select
            value={itemsPerPage.toString()}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
            className="w-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="30">30</option>
            <option value="60">60</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Seznam produktů */}
      {
        loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Žádné produkty</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Tento feed zatím neobsahuje žádné produkty. Synchronizujte feed pro načtení produktů z XML.
            </p>
            <div className="mt-6">
              <button
                onClick={async () => {
                  showNotification('Synchronizace probíhá...', 'info');
                  const res = await authorizedFetch(`/heureka/feeds/${feedId}/sync`, { method: 'POST' });
                  if (res?.ok) {
                    const data = await res.json();
                    showNotification(`Synchronizováno: ${data.stats.created} nových, ${data.stats.updated} aktualizovaných`, 'success');
                    fetchFeedDetails();
                    fetchProducts();
                    fetchCategories();
                  } else {
                    showNotification('Synchronizace selhala', 'error');
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Synchronizovat produkty
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => {
                const isSelected = selectedProducts.has(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProductSelection(product)}
                    className={`
                      relative group p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      hover:shadow-lg hover:-translate-y-1
                      ${isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800'
                      }
                  `}
                  >
                    {/* Selection Badge */}
                    <div className={`absolute top-3 right-3 transition-transform duration-200 ${isSelected ? 'scale-100' : 'scale-0'}`}>
                      <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="flex items-start gap-4">
                      {product.imgUrl ? (
                        <img
                          src={product.imgUrl}
                          alt={product.productName}
                          className="w-20 h-20 object-contain rounded bg-white p-1"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Bez foto</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-1" title={product.productName}>
                          {product.productName}
                        </h3>
                        <p className="text-lg font-bold text-green-600">
                          {product.priceVat} Kč
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {product.itemId}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition ${page === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            )}
          </>
        )
      }
    </div>
  );
}
