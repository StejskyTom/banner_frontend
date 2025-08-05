'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { fakeCarousels } from '../../../lib/data.js';
import Link from 'next/link.js';

export default function CarouselListPage() {
  const router = useRouter();
  const [carousels, setCarousels] = useState(fakeCarousels);

  const handleDelete = (id) => {
    const confirm = window.confirm('Opravdu smazat tento carousel?');
    if (!confirm) return;
    setCarousels(carousels.filter((c) => c.id !== id));
  };

  return (
    <div className='p-6'>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Název
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Počet log
                        </th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Edit</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {carousels.map((carousel) => (
                    <tr key={carousel.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {carousel.title}
                        </th>
                        <td className="px-6 py-4">
                            {carousel.logos.length}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <Link
                                href={`/logo-carousel/${carousel.id}`}
                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                >
                                Editovat
                            </Link>
                        </td>
                    </tr>
                    ))}            
                </tbody>
            </table>
        </div>
    </div>
  );
}
