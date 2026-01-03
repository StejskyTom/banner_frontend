'use client';

import { useEffect, useState, Suspense } from 'react';
import { authorizedFetch } from '../../../lib/api';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, ArrowPathIcon, ShoppingBagIcon, PlusIcon, EllipsisVerticalIcon, CodeBracketIcon } from '@heroicons/react/24/solid';
import { useToast } from "../../components/ToastProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { Dropdown, DropdownItem } from '../../components/Dropdown';
import { WidgetEmbedGenerator } from '../../components/WidgetEmbedGenerator';

function HeurekaFeedsContent() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [embedWidgetId, setEmbedWidgetId] = useState(null);
  const showNotification = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFeeds();
    if (searchParams.get('action') === 'create') {
      openCreateModal();
    }
  }, [searchParams]);

  const fetchFeeds = async () => {
    try {
      const res = await authorizedFetch('/heureka/feeds');
      if (res?.ok) {
        const data = await res.json();
        setFeeds(data);
      } else {
        showNotification('Nepodařilo se načíst feedy', 'error');
      }
    } catch (error) {
      showNotification('Chyba při načítání feedů', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setNewFeedUrl('');
    setNewFeedName('');
    setShowCreateModal(true);
  };

  const submitCreateFeed = async (e) => {
    e.preventDefault();
    if (!newFeedUrl) return;

    try {
      setCreating(true);
      const res = await authorizedFetch('/heureka/feeds', {
        method: 'POST',
        body: JSON.stringify({
          url: newFeedUrl,
          name: newFeedName || 'Nový feed'
        })
      });

      if (res.ok) {
        const data = await res.json();
        showNotification('Feed byl vytvořen, zahajuji synchronizaci...', 'success');
        setShowCreateModal(false);

        // Automatická synchronizace po vytvoření
        try {
          const syncRes = await authorizedFetch(`/heureka/feeds/${data.id}/sync`, {
            method: 'POST'
          });

          if (syncRes.ok) {
            const syncData = await syncRes.json();
            showNotification(`Synchronizováno: ${syncData.stats.created} produktů`, 'success');
          } else {
            showNotification('Synchronizace selhala, zkuste to ručně', 'warning');
          }
        } catch (syncError) {
          showNotification('Synchronizace selhala, zkuste to ručně', 'warning');
        }

        router.push(`/widgets/heureka/${data.id}`);
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Neznámá chyba' }));
        showNotification(errorData.message || 'Nepodařilo se vytvořit feed', 'error');
      }
    } catch (error) {
      showNotification('Chyba při vytváření feedu', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSync = async (feedId) => {
    try {
      showNotification('Synchronizace probíhá...', 'info');
      const res = await authorizedFetch(`/heureka/feeds/${feedId}/sync`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        showNotification(`Synchronizováno: ${data.stats.created} nových, ${data.stats.updated} aktualizovaných`, 'success');
        fetchFeeds(); // Refresh list
      } else {
        showNotification('Synchronizace selhala', 'error');
      }
    } catch (error) {
      showNotification('Chyba při synchronizaci', 'error');
    }
  };

  const handleDeleteClick = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await authorizedFetch(`/heureka/feeds/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setFeeds((prev) => prev.filter((f) => f.id !== deleteId));
        showNotification('Feed byl smazán', 'success');
      } else {
        showNotification('Nepodařilo se smazat feed', 'error');
      }
    } catch (error) {
      showNotification('Chyba při mazání', 'error');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="h-16 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-6 shrink-0 z-10">
        <h1 className="text-lg font-semibold text-white">
          Produktové widgety
        </h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-visualy-accent-4 text-white rounded-lg hover:bg-visualy-accent-4/90 transition-all duration-300 shadow-lg shadow-visualy-accent-4/20 cursor-pointer text-sm font-medium"
        >
          <PlusIcon className="h-4 w-4" />
          Nový produkt
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">

          <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Název</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Počet produktů</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Poslední sync</th>
                  <th scope="col" className="px-6 py-4 text-right font-semibold">Akce</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                      <td className="px-6 py-4"><div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                    </tr>
                  ))
                ) : feeds.length > 0 ? (
                  feeds.map((feed, idx) => (
                    <tr key={feed.id} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{feed.name}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{feed.productCount ?? 0}</td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {feed.lastSyncedAt ? new Date(feed.lastSyncedAt).toLocaleString() : 'Nikdy'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/widgets/heureka/${feed.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                          >
                            <PencilSquareIcon className="h-3.5 w-3.5" />
                            Upravit
                          </Link>
                          <Dropdown
                            trigger={
                              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                                <EllipsisVerticalIcon className="h-5 w-5" />
                              </button>
                            }
                          >
                            <DropdownItem
                              icon={PencilSquareIcon}
                              onClick={() => router.push(`/widgets/heureka/${feed.id}`)}
                            >
                              Upravit
                            </DropdownItem>
                            <DropdownItem
                              icon={CodeBracketIcon}
                              onClick={() => setEmbedWidgetId(feed.id)}
                            >
                              Publikovat
                            </DropdownItem>
                            <DropdownItem
                              icon={ArrowPathIcon}
                              onClick={() => handleSync(feed.id)}
                            >
                              Synchronizovat
                            </DropdownItem>
                            <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                            <DropdownItem
                              icon={TrashIcon}
                              danger={true}
                              onClick={() => handleDeleteClick(feed.id, feed.name)}
                            >
                              Odstranit
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                          <ShoppingBagIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Zatím nemáte žádné feedy</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                          Přidejte svůj první XML feed z Heureky a začněte zobrazovat produkty na svém webu.
                        </p>
                        <button
                          onClick={openCreateModal}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-visualy-accent-4 text-white rounded-lg hover:bg-visualy-accent-4/90 transition-all duration-300 shadow-lg shadow-visualy-accent-4/20 cursor-pointer font-medium"
                        >
                          <PlusIcon className="h-5 w-5" />
                          Vytvořit první feed
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Embed Generator Modal */}
      <WidgetEmbedGenerator
        open={!!embedWidgetId}
        onClose={() => setEmbedWidgetId(null)}
        widgetId={embedWidgetId}
        widgetType="Product"
      />

      {/* Create Feed Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Přidat nový feed</h2>
            <form onSubmit={submitCreateFeed}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL Feedu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    placeholder="https://www.example.com/feed.xml"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-visualy-accent-4 focus:border-visualy-accent-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Název feedu (nepovinné)
                  </label>
                  <input
                    type="text"
                    value={newFeedName}
                    onChange={(e) => setNewFeedName(e.target.value)}
                    placeholder="Např. Hlavní e-shop"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-visualy-accent-4 focus:border-visualy-accent-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-visualy-accent-4 text-white hover:bg-visualy-accent-4/90 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {creating && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {creating ? 'Vytvářím...' : 'Vytvořit feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Opravdu smazat?</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Chcete opravdu smazat feed <strong>{deleteName}</strong>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
              >
                Ne
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Ano, smazat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import Loader from '../../components/Loader';

export default function HeurekaFeedsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <HeurekaFeedsContent />
    </Suspense>
  );
}
