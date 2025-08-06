'use client';

import { useEffect, useState } from 'react';
import { authorizedFetch } from '../../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';

export default function CarouselListPage() {
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await authorizedFetch('/widgets');
        if (res && res.ok) {
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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Opravdu smazat tento carousel?');
    if (!confirmDelete) return;

    try {
      const res = await authorizedFetch(`/widgets/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCarousels((prev) => prev.filter((c) => c.id !== id));
      } else {
        console.error('Smazání selhalo');
      }
    } catch (error) {
      console.error('Chyba při mazání', error);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Načítám data…</div>;
  }

  return (
    <div className="p-6">
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white dark:bg-gray-800">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <tr>
              <th scope="col" className="px-6 py-3">Název</th>
              <th scope="col" className="px-6 py-3">Počet log</th>
              <th scope="col" className="px-6 py-3 text-right">Akce</th>
            </tr>
          </thead>
          <tbody>
            {carousels.length > 0 ? (
              carousels.map((carousel) => (
                <tr
                  key={carousel.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {carousel.title}
                  </td>
                  <td className="px-6 py-4">{carousel.logos?.length ?? 0}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <Link
                      href={`/widgets/logo-carousel/${carousel.id}`}
                      className="text-blue-500 hover:text-blue-700"
                      title="Editovat"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(carousel.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Smazat"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  Žádné carousely nenalezeny.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
