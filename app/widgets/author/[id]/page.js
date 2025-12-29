'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from "../../../components/ToastProvider";
import {
    ChevronLeftIcon,
    CodeBracketIcon,
    ClipboardDocumentIcon,
    XMarkIcon,
    CheckIcon,
    PencilSquareIcon,
    PhotoIcon
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import UploadAttachment from '../../../components/UploadAttachment';
import AuthorImageUpload from '../../../components/AuthorImageUpload';
import Loader from '../../../components/Loader';

export default function AuthorWidgetDetailPage() {
    const { id } = useParams();
    const [widget, setWidget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [authorName, setAuthorName] = useState('');
    const [authorTitle, setAuthorTitle] = useState('');
    const [authorBio, setAuthorBio] = useState('');
    const [authorPhotoUrl, setAuthorPhotoUrl] = useState('');
    const [layout, setLayout] = useState('centered');

    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState('');

    const showNotification = useToast();

    useEffect(() => {
        if (id) {
            fetchWidget();
        }
    }, [id]);

    const fetchWidget = async () => {
        try {
            const res = await authorizedFetch(`/author-widgets/${id}`);
            if (res?.ok) {
                const data = await res.json();
                setWidget(data);
                setEditNameValue(data.name);
                setAuthorName(data.authorName || '');
                setAuthorTitle(data.authorTitle || '');
                setAuthorBio(data.authorBio || '');
                setAuthorPhotoUrl(data.authorPhotoUrl || '');
                setLayout(data.layout || 'centered');
            } else {
                showNotification('Nepodařilo se načíst widget', 'error');
            }
        } catch (error) {
            showNotification('Chyba při načítání widgetu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await authorizedFetch(`/author-widgets/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: editNameValue,
                    authorName,
                    authorTitle,
                    authorBio,
                    authorPhotoUrl,
                    layout
                })
            });

            if (res?.ok) {
                const updatedWidget = await res.json();
                setWidget(updatedWidget);
                setIsEditingName(false);
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

    const generateEmbedCode = () => {
        const embedUrl = `${process.env.NEXT_PUBLIC_API_URL}/author-widgets/${id}/embed.js`;
        return `<script src="${embedUrl}" defer></script>`;
    };

    const copyEmbedCode = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        showNotification('Kód zkopírován do schránky', 'success');
    };

    if (loading) return <Loader />;
    if (!widget) return <div className="p-8 text-center">Widget nenalezen</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/widgets/author"
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </Link>

                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-indigo-500 focus:outline-none"
                                autoFocus
                            />
                            <button
                                onClick={handleSave}
                                className="p-1 text-green-600 hover:text-green-700 transition cursor-pointer"
                                title="Uložit název"
                            >
                                <CheckIcon className="h-6 w-6" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingName(false);
                                    setEditNameValue(widget.name);
                                }}
                                className="p-1 text-red-600 hover:text-red-700 transition cursor-pointer"
                                title="Zrušit"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{widget.name}</h1>
                            <button
                                onClick={() => setIsEditingName(true)}
                                className="opacity-0 group-hover:opacity-100 transition p-1 text-gray-400 hover:text-indigo-600 cursor-pointer"
                                title="Upravit název"
                            >
                                <PencilSquareIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowEmbedModal(true)}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer"
                    >
                        <CodeBracketIcon className="h-5 w-5" />
                        Embed kód
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                        {saving ? 'Ukládám...' : 'Uložit změny'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Column */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Údaje o autorovi</h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Rozložení
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setLayout('centered')}
                                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ${layout === 'centered'
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-1 p-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                        <div className="w-16 h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                        <div className="w-12 h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                    </div>
                                    <span className={`text-sm font-medium ${layout === 'centered' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        Na střed
                                    </span>
                                </button>

                                <button
                                    onClick={() => setLayout('side-by-side')}
                                    className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ${layout === 'side-by-side'
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-2 p-2">
                                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
                                        <div className="flex-1 flex flex-col gap-1">
                                            <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                            <div className="w-2/3 h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-medium ${layout === 'side-by-side' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                        Vedle sebe
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Fotografie autora
                                    </label>

                                    <AuthorImageUpload
                                        widgetId={id}
                                        onUploadComplete={(url) => setAuthorPhotoUrl(url)}
                                    />

                                    <div className="mt-4">
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Nebo vložte URL ručně
                                        </label>
                                        <input
                                            type="text"
                                            value={authorPhotoUrl}
                                            onChange={(e) => setAuthorPhotoUrl(e.target.value)}
                                            placeholder="https://example.com/photo.jpg"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                        />
                                    </div>
                                </div>              </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Jméno a příjmení
                                </label>
                                <input
                                    type="text"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="Např. Jan Novák"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Titul / Krátký popis
                                </label>
                                <input
                                    type="text"
                                    value={authorTitle}
                                    onChange={(e) => setAuthorTitle(e.target.value)}
                                    placeholder="Např. Specialista na SEO"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Bio (dlouhý text)
                                </label>
                                <textarea
                                    value={authorBio}
                                    onChange={(e) => setAuthorBio(e.target.value)}
                                    placeholder="Napište něco o sobě..."
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="lg:sticky lg:top-8 h-fit">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Náhled</h2>
                    <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-8 max-w-2xl mx-auto ${layout === 'side-by-side' ? 'flex flex-col sm:flex-row items-start gap-8 text-left' : 'text-center'
                        }`}>
                        {authorPhotoUrl ? (
                            <img
                                src={authorPhotoUrl}
                                alt={authorName}
                                className={`w-32 h-32 rounded-full object-cover border-4 border-gray-100 flex-shrink-0 ${layout === 'side-by-side' ? '' : 'mx-auto mb-5'
                                    }`}
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Foto'; }}
                            />
                        ) : (
                            <div className={`w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 ${layout === 'side-by-side' ? '' : 'mx-auto mb-5'
                                }`}>
                                <PhotoIcon className="h-12 w-12" />
                            </div>
                        )}

                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {authorName || 'Jméno Autora'}
                            </h3>

                            <div className="text-indigo-600 font-medium uppercase tracking-wide text-sm mb-5">
                                {authorTitle || 'Titul / Pozice'}
                            </div>

                            <p className="text-gray-600 leading-relaxed text-base">
                                {authorBio || 'Zde se zobrazí váš životopis nebo popis...'}
                            </p>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-400 text-center">
                        Poznámka: Toto je pouze náhled. Finální vzhled závisí na CSS vašeho webu.
                    </p>
                </div>
            </div>

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
                            Vložte tento kód do vašich stránek tam, kde chcete zobrazit profil autora.
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
