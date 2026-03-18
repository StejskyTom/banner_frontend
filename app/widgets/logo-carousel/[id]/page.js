'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import EditSidebar from '../../../components/EditSidebar';
import CarouselPreview from '../../../components/CarouselPreview';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from "../../../components/ToastProvider";
import { CodeBracketIcon, HomeIcon, TableCellsIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { WidgetEmbedGenerator } from '../../../components/WidgetEmbedGenerator';
import Link from 'next/link';

import Loader from '../../../components/Loader';

export default function CarouselEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [carousel, setCarousel] = useState(null);
  const [loading, setLoading] = useState(true);
  const showNotification = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const loadCarousel = async () => {
      try {
        const res = await authorizedFetch(`/widgets/${id}`);
        if (res && res.ok) {
          const data = await res.json();
          setCarousel(data);
          setIsDirty(false);
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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const updateCarousel = (newState) => {
    setCarousel(newState);
    setIsDirty(true);
  };

  const handleBack = (e) => {
    e.preventDefault();
    if (isDirty) {
      if (window.confirm('Máte neuložené změny. Opravdu chcete odejít?')) {
        router.push('/widgets/logo-carousel');
      }
    } else {
      router.push('/widgets/logo-carousel');
    }
  };

  if (loading) return <Loader />;
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
          gap: data.gap,
          settings: data.settings
        })
      });

      if (res?.ok) {
        showNotification("Uloženo", "success");
        setIsDirty(false);
      }
      else showNotification("Chyba uložení", "error");

    } catch (err) {
      showNotification("Chyba při ukládání", "error");
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="h-16 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <HomeIcon className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-white truncate max-w-md">
            {carousel.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEmbedModal(true)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-medium text-sm flex items-center gap-2"
          >
            <CodeBracketIcon className="h-4 w-4" />
            Publikovat
          </button>

          <button
            disabled={isSaving}
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-visualy-accent-4 text-white hover:bg-visualy-accent-4/90 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isSaving ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            ) : (
              "Uložit"
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Icon Sidebar */}
        <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-4 shrink-0 z-20">
          <div className="group relative flex items-center justify-center w-full">
            <button
              onClick={() => setActiveTab(activeTab === 'content' ? null : 'content')}
              className={`p-3 rounded-xl transition-all duration-200 ${activeTab === 'content'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <TableCellsIcon className="h-6 w-6 text-visualy-accent-4" />
            </button>
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md border border-gray-800 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Obsah
            </div>
          </div>

          <div className="group relative flex items-center justify-center w-full">
            <button
              onClick={() => setActiveTab(activeTab === 'settings' ? null : 'settings')}
              className={`p-3 rounded-xl transition-all duration-200 ${activeTab === 'settings'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Cog6ToothIcon className="h-6 w-6 text-visualy-accent-4" />
            </button>
            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md border border-gray-800 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Nastavení
            </div>
          </div>
        </div>

        {/* Secondary Panel (EditSidebar) */}
        <EditSidebar
          carousel={carousel}
          setCarousel={updateCarousel}
          activeTab={activeTab}
        />

        {/* Preview Area */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center bg-gray-50 dark:bg-gray-900/50">
          <div className="w-full max-w-5xl">
            <CarouselPreview
              carousel={carousel}
              settings={carousel.settings || {}}
              onUpdate={(updates) => updateCarousel({ ...carousel, ...updates })}
              isEditing={true}
            />
          </div>
        </div>
      </div>

      {/* Embed Code Modal */}
      <WidgetEmbedGenerator
        open={showEmbedModal}
        onClose={() => setShowEmbedModal(false)}
        widgetId={id}
        widgetType="Logo"
      />
    </div>
  );
}
