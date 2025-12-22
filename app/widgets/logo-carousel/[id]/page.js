'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EditSidebar from '../../../components/EditSidebar';
import CarouselPreview from '../../../components/CarouselPreview';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from "../../../components/ToastProvider";


import { CodeBracketIcon, ClipboardDocumentIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function CarouselEditPage() {
  const { id } = useParams();
  const [carousel, setCarousel] = useState(null);
  const [loading, setLoading] = useState(true);
  const showNotification = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  useEffect(() => {
    const loadCarousel = async () => {
      try {
        const res = await authorizedFetch(`/widgets/${id}`);
        if (res && res.ok) {
          const data = await res.json();
          setCarousel(data);
        } else {
          showNotification('Nepodařilo se načíst carousel', 'error');
        }
      } catch (err) {
        showNotification('Chyba při načítání carouselu', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCarousel();
    }
  }, [id, showNotification]);

  if (loading) return <p className="p-6 text-gray-500">Načítám...</p>;
  if (!carousel) return <p className="p-6 text-red-500">Nenalezeno...</p>;

  const handleSave = async () => {
    setIsSaving(true);
    const data = carousel;

    // Build attachmentsLinks object: { attachmentId: link }
    const attachmentsLinks = {};
    data.attachments.forEach(a => {
      if (a.link) {
        attachmentsLinks[a.id] = a.link;
      }
    });

    try {
      const res = await authorizedFetch(`/widgets/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          id: data.id,
          title: data.title,
          attachmentsOrder: data.attachments.map(a => a.id),
          attachmentsLinks: attachmentsLinks,
          imageSize: data.imageSize,
          speed: data.speed,
          pauseOnHover: data.pauseOnHover,
          gap: data.gap
        })
      });

      if (res?.ok) showNotification("Uloženo", "success");
      else showNotification("Chyba uložení", "error");

    } catch (err) {
      showNotification("Chyba při ukládání", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const generateEmbedCode = () => {
    const embedUrl = `${process.env.NEXT_PUBLIC_API_URL}/widget/${id}/embed.js`;
    return `<script src="${embedUrl}" defer></script>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    showNotification('Kód zkopírován do schránky', 'success');
  };

  return (
    <div className="flex">
      <div className="flex-1 p-6 bg-transparent flex flex-col justify-between min-h-screen">
        <div className='text-center'>
          <h1 className="text-2xl font-bold mb-6">{carousel.title}</h1>
          <CarouselPreview
            attachments={carousel.attachments}
            imageSize={carousel.imageSize ?? 64}
            speed={carousel.speed ?? 20}
            font={carousel.font ?? 'Arial'}
            pauseOnHover={carousel.pauseOnHover ?? false}
            gap={carousel.gap ?? 32}
          />
        </div>

        <div className="mt-12 flex justify-center gap-4">
          <button
            onClick={() => setShowEmbedModal(true)}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg shadow-sm transition transform hover:bg-gray-50 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-200 flex items-center gap-2 cursor-pointer"
          >
            <CodeBracketIcon className="h-5 w-5" />
            Embed kód
          </button>

          <button
            disabled={isSaving}
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg transition transform hover:bg-blue-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-2"
          >
            {isSaving && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            {isSaving ? "Zpracovává se…" : "💾 Uložit změny"}
          </button>
        </div>
      </div>

      <EditSidebar carousel={carousel} setCarousel={setCarousel} />

      {/* Embed Code Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Embed kód</h2>
              <button onClick={() => setShowEmbedModal(false)} className="text-gray-400 hover:text-gray-500 cursor-pointer">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Vložte tento kód do vašich stránek tam, kde chcete zobrazit carousel. <br />
            </p>

            <div className="relative">
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-all">
                {generateEmbedCode()}
              </pre>
              <button
                onClick={copyEmbedCode}
                className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 transition cursor-pointer"
                title="Zkopírovat"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <em>Před zkopírováním kódu vše uložte.</em>
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
