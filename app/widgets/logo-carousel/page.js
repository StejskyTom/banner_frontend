'use client';

import { useEffect, useState } from 'react';
import { authorizedFetch } from '../../../lib/api';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import { WidgetEmbedGenerator } from '../../components/WidgetEmbedGenerator';
import {useToast} from "../../../app/components/ToastProvider";
import {useRouter} from "next/navigation";

export default function CarouselListPage() {
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState('');
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
          console.error('Nepodařilo se načíst data');
        }
      } catch (error) {
        console.error('Chyba při načítání widgetů', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        console.error('Smazání selhalo');
      }
    } catch (error) {
      showNotification('Widget se nepodařilo smazat', 'error');
      console.error('Chyba při mazání', error);
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
      setDeleteTitle('');
    }
  };

  // v handleCreate()
  const handleCreate = async () => {
    try {
      const res = await authorizedFetch('/widgets/logo-carousel/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Nový carousel' }) // nebo prázdné
      });

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        router.push(`/widgets/logo-carousel/${data.id}`);
      } else {
        showNotification('Nepodařilo se vytvořit nový carousel', 'error');
      }
    } catch (error) {
      showNotification('Nepodařilo se vytvořit nový XX', 'error');
    }
  };

  return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Logo carousely</h1>
          <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Přidat nový
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Název</th>
              <th scope="col" className="px-6 py-4 font-semibold">Počet log</th>
              <th scope="col" className="px-6 py-4 text-right font-semibold">Akce</th>
            </tr>
            </thead>
            <tbody>
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
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                      </td>
                    </tr>
                ))
            ) : carousels.length > 0 ? (
                carousels.map((carousel, idx) => (
                    <tr
                        key={carousel.id}
                        className={idx % 2 === 0
                            ? 'bg-white dark:bg-gray-900'
                            : 'bg-gray-50 dark:bg-gray-800'
                        }
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {carousel.title}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {carousel.attachments?.length ?? 0}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Link
                            href={`/widgets/logo-carousel/${carousel.id}`}
                            title="Editovat"
                            className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                        >
                          <PencilSquareIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </Link>
                        <button
                            onClick={() => handleDeleteClick(carousel.id, carousel.title)}
                            title="Smazat"
                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition"
                        >
                          <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </button>
                        <WidgetEmbedGenerator
                            widgetId={carousel.id}
                            widgetType="Logo"
                        />
                      </td>
                    </tr>
                ))
            ) : (
                <tr>
                  <td
                      colSpan="3"
                      className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    Žádné carousely nenalezeny.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* Confirm delete modal */}
        {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Opravdu smazat?
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Chcete opravdu smazat widget <strong>{deleteTitle}</strong>?
                  Tuto akci nelze vrátit zpět.
                </p>
                <div className="mt-6 flex justify-between gap-3">
                  <button
                      onClick={() => setShowConfirm(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
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