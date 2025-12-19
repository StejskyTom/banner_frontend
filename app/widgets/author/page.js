'use client';

import { useState, useEffect } from 'react';
import { authorizedFetch } from '../../../lib/api';
import Link from 'next/link';
import { PencilSquareIcon, TrashIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useToast } from "../../components/ToastProvider";
import { useRouter } from "next/navigation";

export default function AuthorWidgetsPage() {
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
            const res = await authorizedFetch('/author-widgets');
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
            const res = await authorizedFetch('/author-widgets', {
                method: 'POST',
                body: JSON.stringify({ name: newWidgetName })
            });

            if (res?.ok) {
                const widget = await res.json();
                showNotification('Widget vytvořen', 'success');
                setShowCreateModal(false);
                setNewWidgetName('');
                router.push(`/widgets/author/${widget.id}`);
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
            const res = await authorizedFetch(`/author-widgets/${widgetToDelete.id}`, {
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
        <div className="p-8 w-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">O autorovi</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Správa widgetů s profilem autora</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 cursor-pointer"
                >
                    <PlusIcon className="h-5 w-5" />
                    Vytvořit nový profil
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Název</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Autor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vytvořeno</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Akce</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {widgets.length > 0 ? (
                                widgets.map((widget) => (
                                    <tr key={widget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                                                    <UserCircleIcon className="h-6 w-6" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{widget.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {widget.authorName || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(widget.createdAt).toLocaleDateString('cs-CZ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/widgets/author/${widget.id}`}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition cursor-pointer"
                                                    title="Upravit"
                                                >
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setWidgetToDelete(widget);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition cursor-pointer"
                                                    title="Smazat"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                                <UserCircleIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Zatím nemáte žádné profily</h3>
                                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                                                Vytvořte si profil autora a zobrazte ho na svém webu.
                                            </p>
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition cursor-pointer"
                                            >
                                                <PlusIcon className="h-5 w-5" />
                                                Vytvořit první profil
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Vytvořit nový profil autora</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Název widgetu (interní)
                                </label>
                                <input
                                    type="text"
                                    value={newWidgetName}
                                    onChange={(e) => setNewWidgetName(e.target.value)}
                                    placeholder="Např. Profil CEO, Autor blogu..."
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
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smazat profil?</h3>
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
