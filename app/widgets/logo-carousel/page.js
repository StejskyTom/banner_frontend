'use client';

import { useEffect, useState } from 'react';
import { authorizedFetch } from '../../../lib/api';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
import { WidgetEmbedGenerator } from '../../components/WidgetEmbedGenerator';

export default function CarouselListPage() {
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteTitle, setDeleteTitle] = useState('');

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
      } else {
        console.error('Smazání selhalo');
      }
    } catch (error) {
      console.error('Chyba při mazání', error);
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
      setDeleteTitle('');
    }
  };

  if (loading) {
    return (
        <div className="p-6 flex justify-center items-center h-40 text-gray-500 dark:text-gray-400">
          Načítám data…
        </div>
    );
  }

  return (
      <div className="p-6">
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
            {carousels.length > 0 ? (
                carousels.map((carousel, idx) => (
                    <tr
                        key={carousel.id}
                        className={`transition-colors duration-150 ${
                            idx % 2 === 0
                                ? 'bg-white dark:bg-gray-900'
                                : 'bg-gray-50 dark:bg-gray-800'
                        } hover:bg-gray-100 dark:hover:bg-gray-700`}
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
                <div className="mt-6 flex justify-end gap-3">
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