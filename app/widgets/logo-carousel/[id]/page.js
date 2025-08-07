'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EditSidebar from '../../../components/EditSidebar';
import CarouselPreview from '../../../components/CarouselPreview';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from "../../../components/ToastProvider";


export default function CarouselEditPage() {
  const { id } = useParams();
  const [carousel, setCarousel] = useState(null);
  const [loading, setLoading] = useState(true);
  const showNotification = useToast();

  useEffect(() => {
    const loadCarousel = async () => {
      try {
        const res = await authorizedFetch(`/widgets/${id}`);
        if (res && res.ok) {
          const data = await res.json();
          setCarousel(data);
        } else {
          console.error('Nepodařilo se načíst carousel');
        }
      } catch (err) {
        console.error('Chyba při načítání carouselu', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCarousel();
    }
  }, [id]);

  if (loading) return <p className="p-6 text-gray-500">Načítám...</p>;
  if (!carousel) return <p className="p-6 text-red-500">Nenalezeno...</p>;

  const handleSave = async () => {
    try {
      const res = await authorizedFetch(`/widgets/${carousel.id}`, {
        method: "PUT",
        body: JSON.stringify({
          id: carousel.id,
          title: carousel.title,
          logos: carousel.logos
        })
      });

      if (res?.ok) {
        showNotification("Změny byli úspěšně uloženy", "success")
      } else {
        showNotification("Změny se nepodařilo uložit", "danger")
      }
    } catch (err) {
      console.error("Chyba při ukládání widgetu:", err);
      showNotification("Změny se nepodařilo uložit", "danger")
    }
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

      <EditSidebar carousel={carousel} setCarousel={setCarousel} onSave={handleSave} />
    </div>
  );
}
