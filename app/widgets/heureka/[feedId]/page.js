'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from "../../../components/ToastProvider";
import {
  XMarkIcon,
  ArrowLeftIcon,
  TableCellsIcon,
  Cog6ToothIcon,
  CodeBracketIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/solid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Loader from '../../../components/Loader';
import Link from 'next/link';
import HeurekaEditSidebar from '../../../components/HeurekaEditSidebar';
import HeurekaPreview from '../../../components/HeurekaPreview';

export default function HeurekaFeedDetailPage() {
  const { feedId } = useParams();
  const [feed, setFeed] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectedProductDetails, setSelectedProductDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [sortBy, setSortBy] = useState('name_asc');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const lastRequestIdRef = useRef(0);

  // Settings
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [layout, setLayout] = useState('carousel');
  const [gridColumns, setGridColumns] = useState(3);
  const [mobileGridColumns, setMobileGridColumns] = useState(1);
  const [widgetTitle, setWidgetTitle] = useState('');
  const [widgetTitleTag, setWidgetTitleTag] = useState('h2');
  const [widgetTitleBold, setWidgetTitleBold] = useState(true);
  const [widgetTitleItalic, setWidgetTitleItalic] = useState(false);
  const [widgetTitleColor, setWidgetTitleColor] = useState('#111827');
  const [widgetTitleSize, setWidgetTitleSize] = useState('24px');
  const [widgetTitleFont, setWidgetTitleFont] = useState('inherit');
  const [widgetTitleAlign, setWidgetTitleAlign] = useState('center');
  const [widgetTitleMarginBottom, setWidgetTitleMarginBottom] = useState(32);
  const [buttonColor, setButtonColor] = useState('#2563eb');
  const [buttonText, setButtonText] = useState('Koupit');
  const [cardBorderRadius, setCardBorderRadius] = useState(16);
  const [cardBackgroundColor, setCardBackgroundColor] = useState('#ffffff');
  const [productNameColor, setProductNameColor] = useState('#111827');
  const [productNameSize, setProductNameSize] = useState('15px');
  const [productNameFont, setProductNameFont] = useState('sans-serif');
  const [productNameBold, setProductNameBold] = useState(true);
  const [productNameItalic, setProductNameItalic] = useState(false);
  const [productNameFull, setProductNameFull] = useState(false);
  const [priceColor, setPriceColor] = useState('#059669');
  const [priceSize, setPriceSize] = useState('22px');
  const [priceFont, setPriceFont] = useState('sans-serif');
  const [priceBold, setPriceBold] = useState(true);
  const [priceItalic, setPriceItalic] = useState(false);
  const [priceFormat, setPriceFormat] = useState('comma'); // 'comma', 'dot', 'no_decimals'

  // Button Typography
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
  const [buttonFontSize, setButtonFontSize] = useState('14px');
  const [buttonFont, setButtonFont] = useState('sans-serif');
  const [buttonBold, setButtonBold] = useState(true);
  const [buttonItalic, setButtonItalic] = useState(false);

  // Card Shadow
  const [cardShadowEnabled, setCardShadowEnabled] = useState(true);
  const [cardShadowColor, setCardShadowColor] = useState('#000000');
  const [cardShadowBlur, setCardShadowBlur] = useState(10);
  const [cardShadowOpacity, setCardShadowOpacity] = useState(10);

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
  }, [feedId, page, itemsPerPage, sortBy, searchTerm, selectedCategory]);

  useEffect(() => {
    if (feed) {
      setLayout(feed.layout || 'carousel');
      if (feed.layoutOptions) {
        setGridColumns(feed.layoutOptions.gridColumns || 3);
        setMobileGridColumns(feed.layoutOptions.mobileGridColumns || 1);
        setWidgetTitle(feed.layoutOptions.widgetTitle || '');
        setWidgetTitleTag(feed.layoutOptions.widgetTitleTag || 'h2');
        setWidgetTitleBold(feed.layoutOptions.widgetTitleBold !== undefined ? feed.layoutOptions.widgetTitleBold : true);
        setWidgetTitleItalic(feed.layoutOptions.widgetTitleItalic || false);
        setWidgetTitleColor(feed.layoutOptions.widgetTitleColor || '#111827');
        setWidgetTitleSize(feed.layoutOptions.widgetTitleSize || '24px');
        setWidgetTitleFont(feed.layoutOptions.widgetTitleFont || 'inherit');
        setWidgetTitleAlign(feed.layoutOptions.widgetTitleAlign || 'center');
        setWidgetTitleMarginBottom(feed.layoutOptions.widgetTitleMarginBottom !== undefined ? feed.layoutOptions.widgetTitleMarginBottom : 32);

        setButtonColor(feed.layoutOptions.buttonColor || '#2563eb');
        setButtonText(feed.layoutOptions.buttonText || 'Koupit');
        setCardBorderRadius(feed.layoutOptions.cardBorderRadius !== undefined ? feed.layoutOptions.cardBorderRadius : 16);
        setCardBackgroundColor(feed.layoutOptions.cardBackgroundColor || '#ffffff');
        setProductNameColor(feed.layoutOptions.productNameColor || '#111827');
        setProductNameSize(feed.layoutOptions.productNameSize || '15px');
        setProductNameFont(feed.layoutOptions.productNameFont || 'sans-serif');
        setProductNameBold(feed.layoutOptions.productNameBold !== undefined ? feed.layoutOptions.productNameBold : true);
        setProductNameItalic(feed.layoutOptions.productNameItalic || false);
        setProductNameFull(feed.layoutOptions.productNameFull || false);
        setPriceColor(feed.layoutOptions.priceColor || '#059669');
        setPriceSize(feed.layoutOptions.priceSize || '22px');
        setPriceFont(feed.layoutOptions.priceFont || 'sans-serif');
        setPriceBold(feed.layoutOptions.priceBold !== undefined ? feed.layoutOptions.priceBold : true);
        setPriceItalic(feed.layoutOptions.priceItalic || false);
        setPriceFormat(feed.layoutOptions.priceFormat || 'comma');

        setButtonTextColor(feed.layoutOptions.buttonTextColor || '#ffffff');
        setButtonFontSize(feed.layoutOptions.buttonFontSize || '14px');
        setButtonFont(feed.layoutOptions.buttonFont || 'sans-serif');
        setButtonBold(feed.layoutOptions.buttonBold !== undefined ? feed.layoutOptions.buttonBold : true);
        setButtonItalic(feed.layoutOptions.buttonItalic || false);

        setCardShadowEnabled(feed.layoutOptions.cardShadowEnabled !== undefined ? feed.layoutOptions.cardShadowEnabled : true);
        setCardShadowColor(feed.layoutOptions.cardShadowColor || '#000000');
        setCardShadowBlur(feed.layoutOptions.cardShadowBlur !== undefined ? feed.layoutOptions.cardShadowBlur : 10);
        setCardShadowOpacity(feed.layoutOptions.cardShadowOpacity !== undefined ? feed.layoutOptions.cardShadowOpacity : 10);
      }
    }
  }, [feed]);

  const fetchFeedDetails = async () => {
    try {
      const res = await authorizedFetch(`/heureka/feeds/${feedId}`);
      if (res?.ok) {
        const data = await res.json();
        setFeed(data);
      }
    } catch (error) {
      showNotification('Chyba při načítání feedu', 'error');
    }
  };

  const fetchProducts = async () => {
    const requestId = ++lastRequestIdRef.current;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      params.append('limit', itemsPerPage);
      params.append('offset', (page - 1) * itemsPerPage);
      params.append('sort', sortBy);

      const res = await authorizedFetch(`/heureka/feeds/${feedId}/products?${params}`);

      if (requestId !== lastRequestIdRef.current) return;

      if (res?.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotalItems(data.total);

        if (selectedProductDetails.length === 0) {
          const selectedRes = await authorizedFetch(`/heureka/feeds/${feedId}/products/selected`);

          if (requestId !== lastRequestIdRef.current) return;

          if (selectedRes?.ok) {
            const selectedData = await selectedRes.json();
            setSelectedProducts(new Set(selectedData.map(p => p.id)));
            setSelectedProductDetails(selectedData);
          }
        }
      }
    } catch (error) {
      if (requestId !== lastRequestIdRef.current) return;
      showNotification('Chyba při načítání produktů', 'error');
    } finally {
      if (requestId === lastRequestIdRef.current) {
        setLoading(false);
      }
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
    setPage(1);
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
            widgetTitle: widgetTitle,
            widgetTitleTag: widgetTitleTag,
            widgetTitleBold: widgetTitleBold,
            widgetTitleItalic: widgetTitleItalic,
            widgetTitleColor: widgetTitleColor,
            widgetTitleSize: widgetTitleSize,
            widgetTitleFont: widgetTitleFont,
            widgetTitleAlign: widgetTitleAlign,
            widgetTitleMarginBottom: parseInt(widgetTitleMarginBottom),
            buttonColor: buttonColor,
            buttonText: buttonText,
            cardBorderRadius: parseInt(cardBorderRadius),
            cardBackgroundColor: cardBackgroundColor,
            productNameColor: productNameColor,
            productNameSize: productNameSize,
            productNameFont: productNameFont,
            productNameBold: productNameBold,
            productNameItalic: productNameItalic,
            productNameFull: productNameFull,
            priceColor: priceColor,
            priceSize: priceSize,
            priceFont: priceFont,
            priceBold: priceBold,
            priceItalic: priceItalic,
            priceFormat: priceFormat,
            buttonTextColor: buttonTextColor,
            buttonFontSize: buttonFontSize,
            buttonFont: buttonFont,
            buttonBold: buttonBold,
            buttonItalic: buttonItalic,
            cardShadowEnabled: cardShadowEnabled,
            cardShadowColor: cardShadowColor,
            cardShadowBlur: cardShadowBlur,
            cardShadowOpacity: cardShadowOpacity
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

  if (loading && !feed) return <Loader />;
  if (!feed) return <div className="p-8 text-center text-red-500">Feed nenalezen</div>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        {/* Top Bar */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <Link
              href="/widgets/heureka"
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold text-white truncate max-w-md">
              {feed.name}
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
              onClick={handleSaveAll}
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
                Produkty
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
          <HeurekaEditSidebar
            activeTab={activeTab}
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            applyFilters={applyFilters}
            loading={loading}
            selectedProducts={selectedProducts}
            toggleProductSelection={toggleProductSelection}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            layout={layout}
            setLayout={setLayout}
            gridColumns={gridColumns}
            setGridColumns={setGridColumns}
            mobileGridColumns={mobileGridColumns}
            setMobileGridColumns={setMobileGridColumns}
            widgetTitle={widgetTitle}
            setWidgetTitle={setWidgetTitle}
            widgetTitleTag={widgetTitleTag}
            setWidgetTitleTag={setWidgetTitleTag}
            widgetTitleBold={widgetTitleBold}
            setWidgetTitleBold={setWidgetTitleBold}
            widgetTitleItalic={widgetTitleItalic}
            setWidgetTitleItalic={setWidgetTitleItalic}
            widgetTitleColor={widgetTitleColor}
            setWidgetTitleColor={setWidgetTitleColor}
            widgetTitleSize={widgetTitleSize}
            setWidgetTitleSize={setWidgetTitleSize}
            widgetTitleFont={widgetTitleFont}
            setWidgetTitleFont={setWidgetTitleFont}
            widgetTitleAlign={widgetTitleAlign}
            setWidgetTitleAlign={setWidgetTitleAlign}
            widgetTitleMarginBottom={widgetTitleMarginBottom}
            setWidgetTitleMarginBottom={setWidgetTitleMarginBottom}
            buttonColor={buttonColor}
            setButtonColor={setButtonColor}
            buttonText={buttonText}
            setButtonText={setButtonText}
            cardBorderRadius={cardBorderRadius}
            setCardBorderRadius={setCardBorderRadius}
            cardBackgroundColor={cardBackgroundColor}
            setCardBackgroundColor={setCardBackgroundColor}
            productNameColor={productNameColor}
            setProductNameColor={setProductNameColor}
            productNameSize={productNameSize}
            setProductNameSize={setProductNameSize}
            productNameFont={productNameFont}
            setProductNameFont={setProductNameFont}
            productNameBold={productNameBold}
            setProductNameBold={setProductNameBold}
            productNameItalic={productNameItalic}
            setProductNameItalic={setProductNameItalic}
            productNameFull={productNameFull}
            setProductNameFull={setProductNameFull}
            priceColor={priceColor}
            setPriceColor={setPriceColor}
            priceSize={priceSize}
            setPriceSize={setPriceSize}
            priceFont={priceFont}
            setPriceFont={setPriceFont}
            priceBold={priceBold}
            setPriceBold={setPriceBold}
            priceItalic={priceItalic}
            setPriceItalic={setPriceItalic}
            priceFormat={priceFormat}
            setPriceFormat={setPriceFormat}
            buttonTextColor={buttonTextColor}
            setButtonTextColor={setButtonTextColor}
            buttonFontSize={buttonFontSize}
            setButtonFontSize={setButtonFontSize}
            buttonFont={buttonFont}
            setButtonFont={setButtonFont}
            buttonBold={buttonBold}
            setButtonBold={setButtonBold}
            buttonItalic={buttonItalic}
            setButtonItalic={setButtonItalic}
            cardShadowEnabled={cardShadowEnabled}
            setCardShadowEnabled={setCardShadowEnabled}
            cardShadowColor={cardShadowColor}
            setCardShadowColor={setCardShadowColor}
            cardShadowBlur={cardShadowBlur}
            setCardShadowBlur={setCardShadowBlur}
            cardShadowOpacity={cardShadowOpacity}
            setCardShadowOpacity={setCardShadowOpacity}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalItems={totalItems}
            feedId={feedId}
            fetchFeedDetails={fetchFeedDetails}
            fetchProducts={fetchProducts}
            fetchCategories={fetchCategories}
          />

          {/* Preview Area */}
          <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center bg-gray-50 dark:bg-gray-900/50">
            <HeurekaPreview
              selectedProductDetails={selectedProductDetails}
              onRemoveProduct={(p) => toggleProductSelection(p)}
              layout={layout}
              gridColumns={gridColumns}
              mobileGridColumns={mobileGridColumns}
              widgetTitle={widgetTitle}
              widgetTitleTag={widgetTitleTag}
              widgetTitleBold={widgetTitleBold}
              widgetTitleItalic={widgetTitleItalic}
              widgetTitleColor={widgetTitleColor}
              widgetTitleSize={widgetTitleSize}
              widgetTitleFont={widgetTitleFont}
              widgetTitleAlign={widgetTitleAlign}
              widgetTitleMarginBottom={widgetTitleMarginBottom}
              buttonText={buttonText}
              buttonColor={buttonColor}
              cardBorderRadius={cardBorderRadius}
              cardBackgroundColor={cardBackgroundColor}
              productNameColor={productNameColor}
              productNameSize={productNameSize}
              productNameFont={productNameFont}
              productNameBold={productNameBold}
              productNameItalic={productNameItalic}
              productNameFull={productNameFull}
              priceColor={priceColor}
              priceSize={priceSize}
              priceFont={priceFont}
              priceBold={priceBold}
              priceItalic={priceItalic}
              priceFormat={priceFormat}
              buttonTextColor={buttonTextColor}
              buttonFontSize={buttonFontSize}
              buttonFont={buttonFont}
              buttonBold={buttonBold}
              buttonItalic={buttonItalic}
              cardShadowEnabled={cardShadowEnabled}
              cardShadowColor={cardShadowColor}
              cardShadowBlur={cardShadowBlur}
              cardShadowOpacity={cardShadowOpacity}
            />
          </div>
        </div>

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
                Vložte tento kód do vašich stránek tam, kde chcete zobrazit widget. <br />
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

        {/* Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl h-[80vh] flex flex-col transform transition-all scale-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Náhled widgetu</h2>
                <button onClick={() => setShowPreviewModal(false)} className="text-gray-400 hover:text-gray-500 cursor-pointer">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative">
                <iframe
                  src={generatePreviewUrl()}
                  className="w-full h-full border-0"
                  title="Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
