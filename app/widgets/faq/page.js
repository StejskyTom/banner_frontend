'use client';

import { useState, useEffect } from 'react';
import { authorizedFetch } from '../../../lib/api';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, PlusIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { useToast } from "../../components/ToastProvider";
import { useRouter } from "next/navigation";
import Loader from '../../components/Loader';
import { WidgetEmbedGenerator } from '../../components/WidgetEmbedGenerator';

export default function FaqWidgetsPage() {
    const [widgets, setWidgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWidgetName, setNewWidgetName] = useState('');
    const [creating, setCreating] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [widgetToDelete, setWidgetToDelete] = useState(null);

    const showNotification = useToast();
    const router = useRouter();

    useEffect(() => {
        fetchWidgets();
    }, []);

    const fetchWidgets = async () => {
        try {
            const res = await authorizedFetch('/faq-widgets');
            if (res?.ok) {
                const data = await res.json();
                setWidgets(data);
            }
        } catch (error) {
            console.error('Error fetching widgets:', error);
            showNotification('Chyba při načítání widgetů', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newWidgetName.trim()) return;

        try {
            setCreating(true);
            const res = await authorizedFetch('/faq-widgets', {
                method: 'POST',
                body: JSON.stringify({ name: newWidgetName })
            });

            if (res?.ok) {
                const widget = await res.json();
                showNotification('Widget vytvořen', 'success');
                setShowCreateModal(false);
                setNewWidgetName('');
                router.push(`/widgets/faq/${widget.id}`);
            } else {
                showNotification('Nepodařilo se vytvořit widget', 'error');
            }
        } catch (error) {
            showNotification('Chyba při vytváření widgetu', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!widgetToDelete) return;

        try {
            const res = await authorizedFetch(`/faq-widgets/${widgetToDelete.id}`, {
                method: 'DELETE'
            });

            if (res?.ok) {
                setWidgets(widgets.filter(w => w.id !== widgetToDelete.id));
                showNotification('Widget smazán', 'success');
                setShowDeleteModal(false);
                setWidgetToDelete(null);
            } else {
                showNotification('Nepodařilo se smazat widget', 'error');
            }
        } catch (error) {
            showNotification('Chyba při mazání widgetu', 'error');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FAQ Widgety</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Správa vašich FAQ sekcí</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-visualy-accent-4 to-emerald-500 text-white text-sm font-medium hover:opacity-90 transition-all duration-300 shadow-lg shadow-visualy-accent-4/30 hover:scale-[1.02]"
                >
                    <PlusIcon className="h-5 w-5" />
                    Nové FAQ
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Název</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Otázek</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Vytvořeno</th>
                            <th scope="col" className="px-6 py-4 text-right font-semibold">Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                                    <td className="px-6 py-4">
                                        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4 flex justify-end gap-2">
                                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : widgets.length > 0 ? (
                            widgets.map((widget, idx) => (
                                <tr key={widget.id} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                                <QuestionMarkCircleIcon className="h-5 w-5" />
                                            </div>
                                            {widget.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {widget.questions?.length || 0}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {new Date(widget.createdAt).toLocaleDateString('cs-CZ')}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <WidgetEmbedGenerator
                                            widgetId={widget.id}
                                            widgetType="FAQ"
                                            minimal={true}
                                        />
                                        <Link
                                            href={`/widgets/faq/${widget.id}`}
                                            title="Upravit"
                                            className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                                        >
                                            <PencilSquareIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setWidgetToDelete(widget);
                                                setShowDeleteModal(true);
                                            }}
                                            title="Smazat"
                                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition"
                                        >
                                            <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                            <QuestionMarkCircleIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Zatím nemáte žádné FAQ</h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                                            Vytvořte si sekci s častými dotazy a pomozte svým zákazníkům najít odpovědi.
                                        </p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition cursor-pointer"
                                        >
                                            <PlusIcon className="h-5 w-5" />
                                            Vytvořit první FAQ
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Vytvořit nový FAQ widget</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Název widgetu
                                </label>
                                <input
                                    type="text"
                                    value={newWidgetName}
                                    onChange={(e) => setNewWidgetName(e.target.value)}
                                    placeholder="Např. Hlavní FAQ, Produktové dotazy..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
                                >
                                    Zrušit
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newWidgetName.trim() || creating}
                                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {creating ? 'Vytvářím...' : 'Vytvořit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smazat FAQ widget?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Opravdu chcete smazat widget "{widgetToDelete?.name}"? Tato akce je nevratná.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition cursor-pointer"
                            >
                                Zrušit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
                            >
                                Smazat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
