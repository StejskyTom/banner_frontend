'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EditSidebar from '../../../components/EditSidebar';
import CarouselPreview from '../../../components/CarouselPreview';
import { fakeCarousels } from '../../../../lib/data.js';

export default function CarouselEditPage() {
  const { id } = useParams();
  const [carousel, setCarousel] = useState(null);

  useEffect(() => {
    const found = fakeCarousels.find((c) => c.id === id);
    if (found) setCarousel(found);
  }, [id]);

  if (!carousel) return <p>Nenalezeno...</p>;

  const handleSave = () => {
    console.log('Ukládám:', carousel);
    // TODO: Uložení na backend nebo localStorage
    alert('Změny byly uloženy.');
  };

  return (
    <div className="flex">
      <div className="flex-1 p-6 bg-transparent flex flex-col justify-between min-h-screen">
        <div className='text-center'>
          <h1 className="text-2xl font-bold mb-6">{carousel.title}</h1>
          <CarouselPreview logos={carousel.logos} />
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg transition transform hover:bg-blue-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            💾 Uložit změny
          </button>
        </div>
      </div>

      <EditSidebar carousel={carousel} setCarousel={setCarousel} />
    </div>
  );
}
