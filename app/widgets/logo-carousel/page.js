'use client';

import { useEffect, useState } from 'react';
import { authorizedFetch } from '../../../lib/api';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, PhotoIcon, PlusIcon, EllipsisVerticalIcon, CodeBracketIcon } from '@heroicons/react/24/solid';
import { WidgetEmbedGenerator } from '../../components/WidgetEmbedGenerator';
import { useToast } from "../../../app/components/ToastProvider";
import { useRouter } from "next/navigation";
import { Dropdown, DropdownItem } from '../../components/Dropdown';

export default function CarouselListPage() {
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState('');

  // embed modal state
  const [embedWidgetId, setEmbedWidgetId] = useState(null);

  const showNotification = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authorizedFetch('/widgets');
        if (res?.ok) {
          const data = await res.json();
          setCarousels(data);
        } else {
          showNotification('Nepodařilo se načíst data', 'error');
        }
      } catch (error) {
        showNotification('Chyba při načítání widgetů', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showNotification]);

  const handleDeleteClick = (id, title) => {
    setDeleteId(id);
    setDeleteTitle(title);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await authorizedFetch(`/widgets/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setCarousels((prev) => prev.filter((c) => c.id !== deleteId));
        showNotification('Widget byl úspěšně smazán');
      } else {
        showNotification('Widget se nepodařilo smazat', 'error');
      }
    } catch (error) {
      showNotification('Widget se nepodařilo smazat', 'error');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
      setDeleteTitle('');
    }
  };

  const handleCreate = async () => {
    try {
      const res = await authorizedFetch('/widgets/logo-carousel/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Nový carousel' })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/widgets/logo-carousel/${data.id}`);
      } else {
        showNotification('Nepodařilo se vytvořit nový carousel', 'error');
      }
    } catch (error) {
      showNotification('Nepodařilo se vytvořit nový carousel', 'error');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="h-16 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-6 shrink-0 z-10">
        <h1 className="text-lg font-semibold text-white">
          Logo carousel
        </h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-visualy-accent-4 text-white rounded-lg hover:bg-visualy-accent-4/90 transition-all duration-300 shadow-lg shadow-visualy-accent-4/20 cursor-pointer text-sm font-medium"
        >
          <PlusIcon className="h-4 w-4" />
          Nový carousel
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">

          <div className="overflow-visible rounded-xl shadow-lg bg-white dark:bg-gray-900">
            <table className="w-full text-sm text-left [&_tbody_tr:last-child_td:first-child]:rounded-bl-xl [&_tbody_tr:last-child_td:last-child]:rounded-br-xl">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold rounded-tl-xl">Název</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Počet log</th>
                  <th scope="col" className="px-6 py-4 text-right font-semibold rounded-tr-xl">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  // Skeleton rows
                  [...Array(5)].map((_, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0
                        ? 'bg-white dark:bg-gray-900'
                        : 'bg-gray-50 dark:bg-gray-800'
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : carousels.length > 0 ? (
                  carousels.map((carousel, idx) => (
                    <tr
                      key={carousel.id}
                      className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {carousel.title}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {carousel.attachments?.length ?? 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/widgets/logo-carousel/${carousel.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-visualy-accent-4 hover:bg-visualy-accent-4/90 shadow-sm shadow-visualy-accent-4/20 rounded-lg transition-all"
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
                              onClick={() => router.push(`/widgets/logo-carousel/${carousel.id}`)}
                            >
                              Upravit
                            </DropdownItem>
                            <DropdownItem
                              icon={CodeBracketIcon}
                              onClick={() => setEmbedWidgetId(carousel.id)}
                            >
                              Publikovat
                            </DropdownItem>
                            <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                            <DropdownItem
                              icon={TrashIcon}
                              danger={true}
                              onClick={() => handleDeleteClick(carousel.id, carousel.title)}
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
                    <td colSpan="3" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                          <PhotoIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Zatím nemáte žádné logo carousely</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                          Vytvořte si carousel s logy partnerů nebo klientů.
                        </p>
                        <button
                          onClick={handleCreate}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-visualy-accent-4 text-white rounded-lg hover:bg-visualy-accent-4/90 transition-all duration-300 shadow-lg shadow-visualy-accent-4/20 cursor-pointer font-medium"
                        >
                          <PlusIcon className="h-5 w-5" />
                          Vytvořit první carousel
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

      {/* Embed Generator Modal (Global) */}
      <WidgetEmbedGenerator
        open={!!embedWidgetId}
        onClose={() => setEmbedWidgetId(null)}
        widgetId={embedWidgetId}
        widgetType="Logo"
      />

      {/* Confirm delete modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Opravdu smazat?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Chcete opravdu smazat widget "{deleteTitle}"?
              Tato akce je nevratná.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
              >
                Zrušit
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Smazat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}