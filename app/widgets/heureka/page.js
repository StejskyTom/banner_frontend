'use client';

import { useEffect, useState } from 'react';
import { authorizedFetch } from '../../../lib/api';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { useToast } from "../../components/ToastProvider";
import { useRouter } from "next/navigation";

export default function HeurekaFeedsPage() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const showNotification = useToast();
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFeeds();
  }, []);

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Heureka Feedy</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Přidat feed
        </button>
      </div>

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
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleSync(feed.id)}
                      title="Synchronizovat"
                      className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition"
                    >
                      <ArrowPathIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </button>
                    <Link
                      href={`/widgets/heureka/${feed.id}`}
                      title="Detail"
                      className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                    >
                      <PencilSquareIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(feed.id, feed.name)}
                      title="Smazat"
                      className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition"
                    >
                      <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                  Žádné feedy nenalezeny.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
