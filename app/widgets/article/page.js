'use strict';
'use client';

import { useState, useEffect } from 'react';
import { authorizedFetch } from '../../../lib/api';
import Link from 'next/link';
import { PlusIcon, PencilSquareIcon, TrashIcon, DocumentTextIcon, EllipsisVerticalIcon, CodeBracketIcon } from '@heroicons/react/24/solid';
import { useToast } from '../../components/ToastProvider';
import { Dropdown, DropdownItem } from '../../components/Dropdown';
import { WidgetEmbedGenerator } from '../../components/WidgetEmbedGenerator';

export default function ArticleWidgetsPage() {
    const [widgets, setWidgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteName, setDeleteName] = useState('');
    const [embedWidgetId, setEmbedWidgetId] = useState(null);
    const showNotification = useToast();

    useEffect(() => {
        fetchWidgets();
    }, []);

    const fetchWidgets = async () => {
        try {
            const res = await authorizedFetch('/article-widgets');
            if (res.ok) {
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

    const createWidget = async () => {
        try {
            const res = await authorizedFetch('/article-widgets', {
                method: 'POST',
                body: JSON.stringify({ name: 'Nový článek' }),
            });
            if (res.ok) {
                const newWidget = await res.json();
                window.location.href = `/widgets/article/${newWidget.id}`;
            } else {
                showNotification('Nepodařilo se vytvořit widget', 'error');
            }
        } catch (error) {
            console.error('Error creating widget:', error);
            showNotification('Chyba při vytváření widgetu', 'error');
        }
    };

    const handleDeleteClick = (id, name) => {
        setDeleteId(id);
        setDeleteName(name);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await authorizedFetch(`/article-widgets/${deleteId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setWidgets(widgets.filter((w) => w.id !== deleteId));
                showNotification('Widget byl smazán', 'success');
            } else {
                showNotification('Nepodařilo se smazat widget', 'error');
            }
        } catch (error) {
            console.error('Error deleting widget:', error);
            showNotification('Chyba při mazání widgetu', 'error');
        } finally {
            setShowConfirm(false);
            setDeleteId(null);
        }
    };



    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Bar */}
            <div className="h-16 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-6 shrink-0 z-10">
                <h1 className="text-lg font-semibold text-white">
                    Články
                </h1>
                <button
                    onClick={createWidget}
                    className="flex items-center gap-2 px-4 py-2 bg-visualy-accent-4 text-white rounded-lg hover:bg-visualy-accent-4/90 transition-all duration-300 shadow-lg shadow-visualy-accent-4/20 cursor-pointer text-sm font-medium"
                >
                    <PlusIcon className="h-4 w-4" />
                    Nový článek
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold">Název</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Poslední úprava</th>
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
                                                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                            </td>
                                            <td className="px-6 py-4 flex justify-end gap-2">
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
                                                        <DocumentTextIcon className="h-5 w-5" />
                                                    </div>
                                                    {widget.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {new Date(widget.updatedAt).toLocaleDateString('cs-CZ')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/widgets/article/${widget.id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-visualy-accent-4 hover:bg-visualy-accent-4/90 shadow-sm shadow-visualy-accent-4/20 rounded-lg transition-all"
                                                    >
                                                        <PencilSquareIcon className="h-3.5 w-3.5" />
                                                        Upravit
                                                    </Link>
                                                    <Dropdown
                                                        trigger={
                                                            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                                                                <EllipsisVerticalIcon className="h-5 w-5" />
                                                            </button>
                                                        }
                                                    >
                                                        <DropdownItem
                                                            icon={PencilSquareIcon}
                                                            onClick={() => window.location.href = `/widgets/article/${widget.id}`}
                                                        >
                                                            Upravit
                                                        </DropdownItem>
                                                        <DropdownItem
                                                            icon={CodeBracketIcon}
                                                            onClick={() => setEmbedWidgetId(widget.id)}
                                                        >
                                                            Publikovat
                                                        </DropdownItem>
                                                        <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                                                        <DropdownItem
                                                            icon={TrashIcon}
                                                            danger={true}
                                                            onClick={() => handleDeleteClick(widget.id, widget.name)}
                                                        >
                                                            Odstranit
                                                        </DropdownItem>
                                                    </Dropdown>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                                    <DocumentTextIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Zatím žádné články</h3>
                                                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                                                    Začněte vytvořením prvního článku.
                                                </p>
                                                <button
                                                    onClick={createWidget}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-visualy-accent-4 text-white rounded-lg hover:bg-visualy-accent-4/90 transition-all duration-300 shadow-lg shadow-visualy-accent-4/20 cursor-pointer font-medium"
                                                >
                                                    <PlusIcon className="h-5 w-5" />
                                                    Vytvořit článek
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Embed Generator Modal */}
            <WidgetEmbedGenerator
                open={!!embedWidgetId}
                onClose={() => setEmbedWidgetId(null)}
                widgetId={embedWidgetId}
                widgetType="Article"
            />

            {/* Delete confirmation modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Opravdu smazat?</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Chcete opravdu smazat článek <strong>{deleteName}</strong>?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Ne
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                Ano, smazat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
