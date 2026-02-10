'use client';

import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
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
  const [isDirty, setIsDirty] = useState(false);
  const lastRequestIdRef = useRef(0);

  // Settings
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [layout, setLayout] = useState('grid');
  const [gridColumns, setGridColumns] = useState(4);
  const [mobileGridColumns, setMobileGridColumns] = useState(1);
  const [carouselArrows, setCarouselArrows] = useState(true);
  const [carouselArrowsBackground, setCarouselArrowsBackground] = useState('#ffffff');
  const [carouselArrowsColor, setCarouselArrowsColor] = useState('#374151');
  const [carouselArrowsBorderRadius, setCarouselArrowsBorderRadius] = useState(50);
  const [carouselDots, setCarouselDots] = useState(true);
  const [carouselDotsColor, setCarouselDotsColor] = useState('#d1d5db');
  const [carouselDotsActiveColor, setCarouselDotsActiveColor] = useState('#2563eb');
  const [carouselDotsMarginTop, setCarouselDotsMarginTop] = useState(16);
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
  const [productNameMarginTop, setProductNameMarginTop] = useState(0);
  const [productNameMarginBottom, setProductNameMarginBottom] = useState(12);

  const [descriptionEnabled, setDescriptionEnabled] = useState(false);
  const [descriptionTag, setDescriptionTag] = useState('p');
  const [descriptionColor, setDescriptionColor] = useState('#4b5563');
  const [descriptionSize, setDescriptionSize] = useState('14px');
  const [descriptionFont, setDescriptionFont] = useState('sans-serif');
  const [descriptionBold, setDescriptionBold] = useState(false);
  const [descriptionItalic, setDescriptionItalic] = useState(false);
  const [descriptionAlign, setDescriptionAlign] = useState('center');
  const [descriptionMarginTop, setDescriptionMarginTop] = useState(0);
  const [descriptionMarginBottom, setDescriptionMarginBottom] = useState(12);
  const [descriptionTruncateLength, setDescriptionTruncateLength] = useState(100);

  // Image Settings
  const [imageHeight, setImageHeight] = useState(192); // 48 * 4 = 192px
  const [imageObjectFit, setImageObjectFit] = useState('contain'); // contain, cover, fill
  const [imagePadding, setImagePadding] = useState(8); // p-2 = 8px
  const [imageMarginBottom, setImageMarginBottom] = useState(16); // mb-4 = 16px
  const [imageBorderRadius, setImageBorderRadius] = useState(6); // rounded-md = 6px

  const [cardBorderEnabled, setCardBorderEnabled] = useState(false);
  const [cardBorderColor, setCardBorderColor] = useState('#e5e7eb');
  const [cardBorderWidth, setCardBorderWidth] = useState(1);
  const [priceColor, setPriceColor] = useState('#059669');
  const [priceSize, setPriceSize] = useState('22px');
  const [priceFont, setPriceFont] = useState('sans-serif');
  const [priceBold, setPriceBold] = useState(true);
  const [priceItalic, setPriceItalic] = useState(false);
  const [priceFormat, setPriceFormat] = useState('comma'); // 'comma', 'dot', 'no_decimals'
  const [priceMarginTop, setPriceMarginTop] = useState(0);
  const [priceMarginBottom, setPriceMarginBottom] = useState(16);

  // Button Typography
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
  const [buttonFontSize, setButtonFontSize] = useState('14px');
  const [buttonFont, setButtonFont] = useState('sans-serif');
  const [buttonBold, setButtonBold] = useState(true);
  const [buttonItalic, setButtonItalic] = useState(false);
  const [buttonMarginTop, setButtonMarginTop] = useState(0);
  const [buttonMarginBottom, setButtonMarginBottom] = useState(0);
  const [buttonBorderRadius, setButtonBorderRadius] = useState(12);


  // Card Shadow
  const [cardShadowEnabled, setCardShadowEnabled] = useState(true);
  const [cardShadowColor, setCardShadowColor] = useState('#000000');
  const [cardShadowBlur, setCardShadowBlur] = useState(10);
  const [cardShadowOpacity, setCardShadowOpacity] = useState(10);

  // Card Padding
  const [cardPaddingX, setCardPaddingX] = useState(20);
  const [cardPaddingY, setCardPaddingY] = useState(20);

  const showNotification = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const createSetter = (setter) => (value) => {
    if (typeof value === 'function') {
      setter((prev) => {
        const newValue = value(prev);
        return newValue;
      });
    } else {
      setter(value);
    }
    setIsDirty(true);
  };

  const handleBack = (e) => {
    e.preventDefault();
    if (isDirty) {
      if (window.confirm('Máte neuložené změny. Opravdu chcete odejít?')) {
        router.push('/widgets/heureka');
      }
    } else {
      router.push('/widgets/heureka');
    }
  };

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
        setLayout(feed.layoutOptions.layout || 'grid');
        setGridColumns(feed.layoutOptions.gridColumns || 4);
        setMobileGridColumns(feed.layoutOptions.mobileGridColumns || 1);
        setCarouselArrows(feed.layoutOptions.carouselArrows !== undefined ? feed.layoutOptions.carouselArrows : true);
        setCarouselArrowsBackground(feed.layoutOptions.carouselArrowsBackground || '#ffffff');
        setCarouselArrowsColor(feed.layoutOptions.carouselArrowsColor || '#374151');
        setCarouselArrowsBorderRadius(feed.layoutOptions.carouselArrowsBorderRadius !== undefined ? feed.layoutOptions.carouselArrowsBorderRadius : 50);

        setCarouselDots(feed.layoutOptions.carouselDots !== undefined ? feed.layoutOptions.carouselDots : true);
        setCarouselDotsColor(feed.layoutOptions.carouselDotsColor || '#d1d5db');
        setCarouselDotsActiveColor(feed.layoutOptions.carouselDotsActiveColor || feed.layoutOptions.buttonColor || '#2563eb');
        setCarouselDotsMarginTop(feed.layoutOptions.carouselDotsMarginTop !== undefined ? feed.layoutOptions.carouselDotsMarginTop : 16);
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
        setCardPaddingX(feed.layoutOptions.cardPaddingX !== undefined ? feed.layoutOptions.cardPaddingX : 20);
        setCardPaddingY(feed.layoutOptions.cardPaddingY !== undefined ? feed.layoutOptions.cardPaddingY : 20);
        setProductNameColor(feed.layoutOptions.productNameColor || '#111827');
        setProductNameSize(feed.layoutOptions.productNameSize || '15px');
        setProductNameFont(feed.layoutOptions.productNameFont || 'sans-serif');
        setProductNameBold(feed.layoutOptions.productNameBold !== undefined ? feed.layoutOptions.productNameBold : true);
        setProductNameItalic(feed.layoutOptions.productNameItalic || false);
        setProductNameFull(feed.layoutOptions.productNameFull || false);
        setProductNameMarginTop(feed.layoutOptions.productNameMarginTop !== undefined ? feed.layoutOptions.productNameMarginTop : 0);
        setProductNameMarginBottom(feed.layoutOptions.productNameMarginBottom !== undefined ? feed.layoutOptions.productNameMarginBottom : 12);

        setDescriptionEnabled(feed.layoutOptions.descriptionEnabled !== undefined ? feed.layoutOptions.descriptionEnabled : false);
        setDescriptionTag(feed.layoutOptions.descriptionTag || 'p');
        setDescriptionColor(feed.layoutOptions.descriptionColor || '#4b5563');
        setDescriptionSize(feed.layoutOptions.descriptionSize || '14px');
        setDescriptionFont(feed.layoutOptions.descriptionFont || 'sans-serif');
        setDescriptionBold(feed.layoutOptions.descriptionBold !== undefined ? feed.layoutOptions.descriptionBold : false);
        setDescriptionItalic(feed.layoutOptions.descriptionItalic || false);
        setDescriptionAlign(feed.layoutOptions.descriptionAlign || 'center');
        setDescriptionMarginTop(feed.layoutOptions.descriptionMarginTop !== undefined ? feed.layoutOptions.descriptionMarginTop : 0);
        setDescriptionMarginBottom(feed.layoutOptions.descriptionMarginBottom !== undefined ? feed.layoutOptions.descriptionMarginBottom : 12);
        setDescriptionTruncateLength(feed.layoutOptions.descriptionTruncateLength !== undefined ? feed.layoutOptions.descriptionTruncateLength : 100);

        setImageHeight(feed.layoutOptions.imageHeight !== undefined ? feed.layoutOptions.imageHeight : 192);
        setImageObjectFit(feed.layoutOptions.imageObjectFit || 'contain');
        setImagePadding(feed.layoutOptions.imagePadding !== undefined ? feed.layoutOptions.imagePadding : 8);
        setImageMarginBottom(feed.layoutOptions.imageMarginBottom !== undefined ? feed.layoutOptions.imageMarginBottom : 16);
        setImageBorderRadius(feed.layoutOptions.imageBorderRadius !== undefined ? feed.layoutOptions.imageBorderRadius : 6);

        setCardBorderEnabled(feed.layoutOptions.cardBorderEnabled !== undefined ? feed.layoutOptions.cardBorderEnabled : false);
        setCardBorderColor(feed.layoutOptions.cardBorderColor || '#e5e7eb');
        setCardBorderWidth(feed.layoutOptions.cardBorderWidth !== undefined ? feed.layoutOptions.cardBorderWidth : 1);

        setPriceColor(feed.layoutOptions.priceColor || '#059669');
        setPriceSize(feed.layoutOptions.priceSize || '22px');
        setPriceFont(feed.layoutOptions.priceFont || 'sans-serif');
        setPriceBold(feed.layoutOptions.priceBold !== undefined ? feed.layoutOptions.priceBold : true);
        setPriceItalic(feed.layoutOptions.priceItalic || false);
        setPriceFormat(feed.layoutOptions.priceFormat || 'comma');
        setPriceMarginTop(feed.layoutOptions.priceMarginTop !== undefined ? feed.layoutOptions.priceMarginTop : 0);
        setPriceMarginBottom(feed.layoutOptions.priceMarginBottom !== undefined ? feed.layoutOptions.priceMarginBottom : 16);

        setButtonTextColor(feed.layoutOptions.buttonTextColor || '#ffffff');
        setButtonFontSize(feed.layoutOptions.buttonFontSize || '14px');
        setButtonFont(feed.layoutOptions.buttonFont || 'sans-serif');
        setButtonBold(feed.layoutOptions.buttonBold !== undefined ? feed.layoutOptions.buttonBold : true);
        setButtonItalic(feed.layoutOptions.buttonItalic || false);
        setButtonMarginTop(feed.layoutOptions.buttonMarginTop !== undefined ? feed.layoutOptions.buttonMarginTop : 0);
        setButtonMarginBottom(feed.layoutOptions.buttonMarginBottom !== undefined ? feed.layoutOptions.buttonMarginBottom : 0);
        setButtonBorderRadius(feed.layoutOptions.buttonBorderRadius !== undefined ? feed.layoutOptions.buttonBorderRadius : 12);


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
    setIsDirty(true);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedProductDetails((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setIsDirty(true);
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
            layout: layout,
            gridColumns: parseInt(gridColumns),
            mobileGridColumns: parseInt(mobileGridColumns),
            carouselArrows,
            carouselArrowsBackground,
            carouselArrowsColor,
            carouselArrowsBorderRadius: parseInt(carouselArrowsBorderRadius),
            carouselDots,
            carouselDotsColor,
            carouselDotsActiveColor,
            carouselDotsMarginTop: parseInt(carouselDotsMarginTop),
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
            productNameMarginTop: parseInt(productNameMarginTop),
            productNameMarginBottom: parseInt(productNameMarginBottom),
            imageHeight: parseInt(imageHeight),
            imageObjectFit: imageObjectFit,
            imagePadding: parseInt(imagePadding),
            imageMarginBottom: parseInt(imageMarginBottom),
            imageBorderRadius: parseInt(imageBorderRadius),
            priceColor: priceColor,
            priceSize: priceSize,
            priceFont: priceFont,
            priceBold: priceBold,
            priceItalic: priceItalic,
            priceFormat: priceFormat,
            priceMarginTop: parseInt(priceMarginTop),
            priceMarginBottom: parseInt(priceMarginBottom),
            buttonTextColor: buttonTextColor,
            buttonFontSize: buttonFontSize,
            buttonFont: buttonFont,
            buttonBold: buttonBold,
            buttonItalic: buttonItalic,
            buttonMarginTop: parseInt(buttonMarginTop),
            buttonMarginBottom: parseInt(buttonMarginBottom),
            buttonBorderRadius: parseInt(buttonBorderRadius),
            cardShadowEnabled: cardShadowEnabled,
            cardShadowColor: cardShadowColor,
            cardShadowBlur: cardShadowBlur,
            cardShadowOpacity: cardShadowOpacity,
            cardBorderEnabled: cardBorderEnabled,
            cardBorderColor: cardBorderColor,
            cardBorderWidth: parseInt(cardBorderWidth),
            cardPaddingX: parseInt(cardPaddingX),
            cardPaddingY: parseInt(cardPaddingY),
            descriptionEnabled,
            descriptionTag,
            descriptionColor,
            descriptionSize,
            descriptionFont,
            descriptionBold,
            descriptionItalic,
            descriptionAlign,
            descriptionMarginTop: parseInt(descriptionMarginTop),
            descriptionMarginBottom: parseInt(descriptionMarginBottom),
            descriptionTruncateLength: parseInt(descriptionTruncateLength)
          },
          url: feed.url,
          name: feed.name
        })
      });

      const [selectionRes, settingsRes] = await Promise.all([saveSelectionPromise, saveSettingsPromise]);

      if (selectionRes?.ok && settingsRes?.ok) {
        const updatedFeed = await settingsRes.json();
        setFeed(updatedFeed);
        setIsDirty(false);
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


  const handleProductDescriptionChange = async (productId, newDescription) => {
    setSelectedProductDetails(prev => prev.map(p =>
      p.id === productId ? { ...p, description: newDescription } : p
    ));
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, description: newDescription } : p
    ));

    try {
      const res = await authorizedFetch(`/heureka/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ description: newDescription })
      });

      if (!res.ok) {
        showNotification('Nepodařilo se uložit popis produktu', 'error');
      }
    } catch (error) {
      showNotification('Chyba při ukládání popisu produktu', 'error');
    }
  };

  const handleProductNameChange = async (productId, newName) => {
    // 1. Update local state immediately for responsiveness
    setSelectedProductDetails(prev => prev.map(p =>
      p.id === productId ? { ...p, productName: newName } : p
    ));

    // Also update the main products list if the product is there
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, productName: newName } : p
    ));

    // 2. Call API to save changes
    try {
      const res = await authorizedFetch(`/heureka/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ productName: newName })
      });

      if (!res.ok) {
        showNotification('Nepodařilo se uložit název produktu', 'error');
      }
    } catch (error) {
      showNotification('Chyba při ukládání názvu produktu', 'error');
    }
  };

  if (loading && !feed) return <Loader />;
  if (!feed) return <div className="p-8 text-center text-red-500">Feed nenalezen</div>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        {/* Top Bar */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
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
            setLayout={createSetter(setLayout)}
            gridColumns={gridColumns}
            setGridColumns={createSetter(setGridColumns)}
            mobileGridColumns={mobileGridColumns}
            setMobileGridColumns={createSetter(setMobileGridColumns)}
            carouselArrows={carouselArrows}
            setCarouselArrows={createSetter(setCarouselArrows)}
            carouselArrowsBackground={carouselArrowsBackground}
            setCarouselArrowsBackground={createSetter(setCarouselArrowsBackground)}
            carouselArrowsColor={carouselArrowsColor}
            setCarouselArrowsColor={createSetter(setCarouselArrowsColor)}
            carouselArrowsBorderRadius={carouselArrowsBorderRadius}
            setCarouselArrowsBorderRadius={createSetter(setCarouselArrowsBorderRadius)}
            carouselDots={carouselDots}
            setCarouselDots={createSetter(setCarouselDots)}
            carouselDotsColor={carouselDotsColor}
            setCarouselDotsColor={createSetter(setCarouselDotsColor)}
            carouselDotsActiveColor={carouselDotsActiveColor}
            setCarouselDotsActiveColor={createSetter(setCarouselDotsActiveColor)}
            carouselDotsMarginTop={carouselDotsMarginTop}
            setCarouselDotsMarginTop={createSetter(setCarouselDotsMarginTop)}
            widgetTitle={widgetTitle}
            setWidgetTitle={createSetter(setWidgetTitle)}
            widgetTitleTag={widgetTitleTag}
            setWidgetTitleTag={createSetter(setWidgetTitleTag)}
            widgetTitleBold={widgetTitleBold}
            setWidgetTitleBold={createSetter(setWidgetTitleBold)}
            widgetTitleItalic={widgetTitleItalic}
            setWidgetTitleItalic={createSetter(setWidgetTitleItalic)}
            widgetTitleColor={widgetTitleColor}
            setWidgetTitleColor={createSetter(setWidgetTitleColor)}
            widgetTitleSize={widgetTitleSize}
            setWidgetTitleSize={createSetter(setWidgetTitleSize)}
            widgetTitleFont={widgetTitleFont}
            setWidgetTitleFont={createSetter(setWidgetTitleFont)}
            widgetTitleAlign={widgetTitleAlign}
            setWidgetTitleAlign={createSetter(setWidgetTitleAlign)}
            widgetTitleMarginBottom={widgetTitleMarginBottom}
            setWidgetTitleMarginBottom={createSetter(setWidgetTitleMarginBottom)}
            buttonColor={buttonColor}
            setButtonColor={createSetter(setButtonColor)}
            buttonText={buttonText}
            setButtonText={createSetter(setButtonText)}
            cardBorderRadius={cardBorderRadius}
            setCardBorderRadius={createSetter(setCardBorderRadius)}
            cardBackgroundColor={cardBackgroundColor}
            setCardBackgroundColor={createSetter(setCardBackgroundColor)}
            productNameColor={productNameColor}
            setProductNameColor={createSetter(setProductNameColor)}
            productNameSize={productNameSize}
            setProductNameSize={createSetter(setProductNameSize)}
            productNameFont={productNameFont}
            setProductNameFont={createSetter(setProductNameFont)}
            productNameBold={productNameBold}
            setProductNameBold={createSetter(setProductNameBold)}
            productNameItalic={productNameItalic}
            setProductNameItalic={createSetter(setProductNameItalic)}
            productNameFull={productNameFull}
            setProductNameFull={createSetter(setProductNameFull)}
            productNameMarginTop={productNameMarginTop}
            setProductNameMarginTop={createSetter(setProductNameMarginTop)}
            productNameMarginBottom={productNameMarginBottom}
            setProductNameMarginBottom={createSetter(setProductNameMarginBottom)}

            descriptionEnabled={descriptionEnabled}
            setDescriptionEnabled={createSetter(setDescriptionEnabled)}
            descriptionTag={descriptionTag}
            setDescriptionTag={createSetter(setDescriptionTag)}
            descriptionColor={descriptionColor}
            setDescriptionColor={createSetter(setDescriptionColor)}
            descriptionSize={descriptionSize}
            setDescriptionSize={createSetter(setDescriptionSize)}
            descriptionFont={descriptionFont}
            setDescriptionFont={createSetter(setDescriptionFont)}
            descriptionBold={descriptionBold}
            setDescriptionBold={createSetter(setDescriptionBold)}
            descriptionItalic={descriptionItalic}
            setDescriptionItalic={createSetter(setDescriptionItalic)}
            descriptionAlign={descriptionAlign}
            setDescriptionAlign={createSetter(setDescriptionAlign)}
            descriptionMarginTop={descriptionMarginTop}
            setDescriptionMarginTop={createSetter(setDescriptionMarginTop)}
            descriptionMarginBottom={descriptionMarginBottom}
            setDescriptionMarginBottom={createSetter(setDescriptionMarginBottom)}

            imageHeight={imageHeight}
            setImageHeight={createSetter(setImageHeight)}
            imageObjectFit={imageObjectFit}
            setImageObjectFit={createSetter(setImageObjectFit)}
            imagePadding={imagePadding}
            setImagePadding={createSetter(setImagePadding)}
            imageMarginBottom={imageMarginBottom}
            setImageMarginBottom={createSetter(setImageMarginBottom)}
            imageBorderRadius={imageBorderRadius}
            setImageBorderRadius={createSetter(setImageBorderRadius)}
            priceColor={priceColor}
            setPriceColor={createSetter(setPriceColor)}
            priceSize={priceSize}
            setPriceSize={createSetter(setPriceSize)}
            priceFont={priceFont}
            setPriceFont={createSetter(setPriceFont)}
            priceBold={priceBold}
            setPriceBold={createSetter(setPriceBold)}
            priceItalic={priceItalic}
            setPriceItalic={createSetter(setPriceItalic)}
            priceFormat={priceFormat}
            setPriceFormat={createSetter(setPriceFormat)}
            priceMarginTop={priceMarginTop}
            setPriceMarginTop={createSetter(setPriceMarginTop)}
            priceMarginBottom={priceMarginBottom}
            setPriceMarginBottom={createSetter(setPriceMarginBottom)}
            buttonTextColor={buttonTextColor}
            setButtonTextColor={createSetter(setButtonTextColor)}
            buttonFontSize={buttonFontSize}
            setButtonFontSize={createSetter(setButtonFontSize)}
            buttonFont={buttonFont}
            setButtonFont={createSetter(setButtonFont)}
            buttonBold={buttonBold}
            setButtonBold={createSetter(setButtonBold)}
            buttonItalic={buttonItalic}
            setButtonItalic={createSetter(setButtonItalic)}
            buttonMarginTop={buttonMarginTop}
            setButtonMarginTop={createSetter(setButtonMarginTop)}
            buttonMarginBottom={buttonMarginBottom}
            setButtonMarginBottom={createSetter(setButtonMarginBottom)}
            buttonBorderRadius={buttonBorderRadius}
            setButtonBorderRadius={createSetter(setButtonBorderRadius)}
            cardShadowEnabled={cardShadowEnabled}
            setCardShadowEnabled={createSetter(setCardShadowEnabled)}
            cardShadowColor={cardShadowColor}
            setCardShadowColor={createSetter(setCardShadowColor)}
            cardShadowBlur={cardShadowBlur}
            setCardShadowBlur={createSetter(setCardShadowBlur)}

            cardShadowOpacity={cardShadowOpacity}
            setCardShadowOpacity={createSetter(setCardShadowOpacity)}



            descriptionTruncateLength={descriptionTruncateLength}
            setDescriptionTruncateLength={createSetter(setDescriptionTruncateLength)}

            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalItems={totalItems}
            feedId={feedId}
            fetchFeedDetails={fetchFeedDetails}
            fetchProducts={fetchProducts}

            cardBorderEnabled={cardBorderEnabled}
            setCardBorderEnabled={createSetter(setCardBorderEnabled)}
            cardBorderColor={cardBorderColor}
            setCardBorderColor={createSetter(setCardBorderColor)}
            cardBorderWidth={cardBorderWidth}
            setCardBorderWidth={createSetter(setCardBorderWidth)}
            cardPaddingX={cardPaddingX}
            setCardPaddingX={createSetter(setCardPaddingX)}
            cardPaddingY={cardPaddingY}
            setCardPaddingY={createSetter(setCardPaddingY)}
          />

          {/* Preview Area */}
          <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center bg-gray-50 dark:bg-gray-900/50">
            <HeurekaPreview
              selectedProductDetails={selectedProductDetails}
              onRemoveProduct={(p) => toggleProductSelection(p)}
              onProductNameChange={handleProductNameChange}
              onProductDescriptionChange={handleProductDescriptionChange}
              layout={layout}
              gridColumns={gridColumns}
              mobileGridColumns={mobileGridColumns}
              carouselArrows={carouselArrows}
              carouselArrowsBackground={carouselArrowsBackground}
              carouselArrowsColor={carouselArrowsColor}
              carouselArrowsBorderRadius={carouselArrowsBorderRadius}
              carouselDots={carouselDots}
              carouselDotsColor={carouselDotsColor}
              carouselDotsActiveColor={carouselDotsActiveColor}
              carouselDotsMarginTop={carouselDotsMarginTop}
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
              cardPaddingX={cardPaddingX}
              cardPaddingY={cardPaddingY}
              productNameColor={productNameColor}
              productNameSize={productNameSize}
              productNameFont={productNameFont}
              productNameBold={productNameBold}
              productNameItalic={productNameItalic}
              productNameFull={productNameFull}
              productNameMarginTop={productNameMarginTop}
              productNameMarginBottom={productNameMarginBottom}
              descriptionEnabled={descriptionEnabled}
              descriptionTag={descriptionTag}
              descriptionColor={descriptionColor}
              descriptionSize={descriptionSize}
              descriptionFont={descriptionFont}
              descriptionBold={descriptionBold}
              descriptionItalic={descriptionItalic}
              descriptionAlign={descriptionAlign}
              descriptionMarginTop={descriptionMarginTop}
              descriptionMarginBottom={descriptionMarginBottom}
              descriptionTruncateLength={descriptionTruncateLength}
              imageHeight={imageHeight}
              imageObjectFit={imageObjectFit}
              imagePadding={imagePadding}
              imageMarginBottom={imageMarginBottom}
              imageBorderRadius={imageBorderRadius}
              priceColor={priceColor}
              priceSize={priceSize}
              priceFont={priceFont}
              priceBold={priceBold}
              priceItalic={priceItalic}
              priceFormat={priceFormat}
              priceMarginTop={priceMarginTop}
              priceMarginBottom={priceMarginBottom}
              buttonTextColor={buttonTextColor}
              buttonFontSize={buttonFontSize}
              buttonFont={buttonFont}
              buttonBold={buttonBold}
              buttonItalic={buttonItalic}
              buttonMarginTop={buttonMarginTop}
              buttonMarginBottom={buttonMarginBottom}
              buttonBorderRadius={buttonBorderRadius}
              cardShadowEnabled={cardShadowEnabled}
              cardShadowColor={cardShadowColor}
              cardShadowBlur={cardShadowBlur}

              cardShadowOpacity={cardShadowOpacity}
              cardBorderEnabled={cardBorderEnabled}
              cardBorderColor={cardBorderColor}
              cardBorderWidth={cardBorderWidth}
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
