'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from "../../../components/ToastProvider";
import {
    HomeIcon,
    CodeBracketIcon,
    CheckIcon,
    PencilSquareIcon,
    TableCellsIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/solid';
import { WidgetEmbedGenerator } from '../../../components/WidgetEmbedGenerator';
import Link from 'next/link';
import Loader from '../../../components/Loader';
import AuthorEditSidebar from '../../../components/AuthorEditSidebar';
import AuthorPreview from '../../../components/AuthorPreview';

export default function AuthorWidgetDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [widget, setWidget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('content');

    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    const showNotification = useToast();

    useEffect(() => {
        if (id) {
            fetchWidget();
        }
    }, [id]);

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

    const fetchWidget = async () => {
        try {
            const res = await authorizedFetch(`/author-widgets/${id}`);
            if (res?.ok) {
                const data = await res.json();
                setWidget(data);
                setEditNameValue(data.name);
                setIsDirty(false);
            } else {
                showNotification('Nepodařilo se načíst widget', 'error');
            }
        } catch (error) {
            showNotification('Chyba při načítání widgetu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateWidget = (newState) => {
        setWidget(newState);
        setIsDirty(true);
    };

    const handleBack = (e) => {
        e.preventDefault();
        if (isDirty) {
            if (window.confirm('Máte neuložené změny. Opravdu chcete odejít?')) {
                router.push('/widgets/author');
            }
        } else {
            router.push('/widgets/author');
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await authorizedFetch(`/author-widgets/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: widget.name,
                    authorName: widget.authorName,
                    authorTitle: widget.authorTitle,
                    authorBio: widget.authorBio,
                    authorPhotoUrl: widget.authorPhotoUrl,
                    layout: widget.layout,
                    backgroundColor: widget.backgroundColor,
                    borderRadius: widget.borderRadius,
                    settings: widget.settings
                })
            });

            if (res?.ok) {
                const updatedWidget = await res.json();
                setWidget(updatedWidget);
                setIsEditingName(false);
                setIsDirty(false);
                showNotification('Změny uloženy', 'success');
            } else {
                showNotification('Nepodařilo se uložit změny', 'error');
            }
        } catch (error) {
            showNotification('Chyba při ukládání', 'error');
        } finally {
            setSaving(false);
        }
    };



    if (loading) return <Loader />;
    if (!widget) return <div className="p-8 text-center">Widget nenalezen</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
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
                        {widget.name}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition duration-200"
                        title="Hledat (Cmd+K)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                    <button
                        onClick={() => setShowEmbedModal(true)}
                        className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        <CodeBracketIcon className="h-4 w-4" />
                        Publikovat
                    </button>

                    <button
                        disabled={saving}
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-visualy-accent-4 text-white hover:bg-visualy-accent-4/90 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    >
                        {saving ? (
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

                {/* Edit Sidebar */}
                {activeTab && (
                    <AuthorEditSidebar
                        widget={widget}
                        setWidget={updateWidget}
                        activeTab={activeTab}
                    />
                )}

                {/* Preview Area */}
                <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900/50 relative">
                    <AuthorPreview widget={widget} />
                </div>
            </div>

            {/* Embed Code Modal */}
            <WidgetEmbedGenerator
                open={showEmbedModal}
                onClose={() => setShowEmbedModal(false)}
                widgetId={id}
                widgetType="Author"
            />
        </div>
    );
}
