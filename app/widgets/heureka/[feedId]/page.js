'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from "../../../components/ToastProvider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function HeurekaFeedDetailPage() {
  const { feedId } = useParams();
  const [feed, setFeed] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const showNotification = useToast();

  useEffect(() => {
    if (feedId) {
      fetchFeedDetails();
      fetchProducts();
      fetchCategories();
    }
  }, [feedId]);

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
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const res = await authorizedFetch(`/heureka/feeds/${feedId}/products?${params}`);
      if (res?.ok) {
        const data = await res.json();
        setProducts(data.products);

        // Load previously selected products
        const selectedRes = await authorizedFetch(`/heureka/feeds/${feedId}/products/selected`);
        if (selectedRes?.ok) {
          const selectedData = await selectedRes.json();
          setSelectedProducts(new Set(selectedData.map(p => p.id)));
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
    fetchProducts();
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSaveSelection = async () => {
    try {
      const res = await authorizedFetch(`/heureka/feeds/${feedId}/products/selection`, {
        method: 'PUT',
        body: JSON.stringify({
          selectedProductIds: Array.from(selectedProducts)
        })
      });

      if (res?.ok) {
        showNotification('Výběr produktů byl uložen', 'success');
      } else {
        showNotification('Nepodařilo se uložit výběr', 'error');
      }
    } catch (error) {
      showNotification('Chyba při ukládání', 'error');
    }
  };

  const generateEmbedCode = () => {
    const embedUrl = `${process.env.NEXT_PUBLIC_API_URL}/heureka/feed/${feedId}/embed.js`;
    return `<script src="${embedUrl}"></script>`;
  };

  if (loading) return <p className="p-6 text-gray-500">Načítám...</p>;
  if (!feed) return <p className="p-6 text-red-500">Feed nenalezen</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{feed.name}</h1>
          <p className="text-sm text-gray-500">
            Celkem produktů: {feed.productCount} | Vybráno: {selectedProducts.size}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveSelection}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Uložit výběr
          </button>
        </div>
      </div>

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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Všechny kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny kategorie</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name} ({cat.productCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Filtrovat
            </button>
          </div>
        </div>
      </div>

      {/* Seznam produktů */}
      {products.length === 0 ? (
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Synchronizovat produkty
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => toggleProductSelection(product.id)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition
                ${selectedProducts.has(product.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => {}}
                  className="mt-1"
                />
                {product.imgUrl && (
                  <img
                    src={product.imgUrl}
                    alt={product.productName}
                    className="w-16 h-16 object-contain rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                    {product.productName}
                  </h3>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {product.priceVat} Kč
                  </p>
                  {product.category && (
                    <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embed code */}
      <div className="mt-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Embed kód:</h3>
        <pre className="bg-white dark:bg-gray-900 p-3 rounded text-sm overflow-x-auto">
          {generateEmbedCode()}
        </pre>
      </div>
    </div>
  );
}
