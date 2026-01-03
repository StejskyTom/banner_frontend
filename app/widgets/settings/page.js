'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    CreditCardIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { unauthorizedFetch, authorizedFetch } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import Link from 'next/link';

export default function SettingsPage() {
    const { data: session } = useSession();

    const [billing, setBilling] = useState({
        name: '',
        ico: '',
        dic: '',
        street: '',
        city: '',
        zip: ''
    });

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const showNotification = useToast();

    useEffect(() => {
        fetchBilling();
    }, []);

    const fetchBilling = async () => {
        try {
            const res = await authorizedFetch('/subscription');
            if (res.ok) {
                const data = await res.json();
                if (data.billing) {
                    setBilling(data.billing);
                }
            }
        } catch (err) {
            // silent error
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBilling = async () => {
        setProcessing(true);
        try {
            const res = await authorizedFetch('/subscription/billing', {
                method: 'POST',
                body: JSON.stringify({ billing })
            });

            if (res.ok) {
                showNotification('Fakturační údaje uloženy', 'success');
            } else {
                showNotification('Chyba při ukládání', 'error');
            }
        } catch (err) {
            showNotification('Chyba připojení', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-visualy-accent-4"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Bar */}
            <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 shrink-0 z-10">
                <h1 className="text-lg font-semibold text-white">Nastavení</h1>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                        <Link href="/widgets/settings" className="px-6 py-4 text-sm font-medium text-visualy-accent-4 border-b-2 border-visualy-accent-4 transition-all">
                            <div className="flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5" />
                                Fakturační údaje
                            </div>
                        </Link>
                        <Link href="/widgets/settings/subscription" className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent transition-all">
                            <div className="flex items-center gap-2">
                                <CreditCardIcon className="w-5 h-5" />
                                Správa předplatného
                            </div>
                        </Link>
                    </div>

                    <div className="animate-fadeIn w-full">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Firemní a kontaktní údaje</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Firma / Jméno</label>
                                    <input
                                        type="text"
                                        value={billing.name || ''}
                                        onChange={e => setBilling({ ...billing, name: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IČO</label>
                                    <input
                                        type="text"
                                        value={billing.ico || ''}
                                        onChange={e => setBilling({ ...billing, ico: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DIČ</label>
                                    <input
                                        type="text"
                                        value={billing.dic || ''}
                                        onChange={e => setBilling({ ...billing, dic: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ulice a číslo popisné</label>
                                    <input
                                        type="text"
                                        value={billing.street || ''}
                                        onChange={e => setBilling({ ...billing, street: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Město</label>
                                    <input
                                        type="text"
                                        value={billing.city || ''}
                                        onChange={e => setBilling({ ...billing, city: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PSČ</label>
                                    <input
                                        type="text"
                                        value={billing.zip || ''}
                                        onChange={e => setBilling({ ...billing, zip: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="lg:col-span-2 pt-4 flex justify-end">
                                    <button
                                        onClick={handleSaveBilling}
                                        disabled={processing}
                                        className="px-6 py-2 bg-visualy-accent-4 text-white rounded-lg hover:bg-visualy-accent-4/90 transition-colors disabled:opacity-50 font-medium shadow-lg shadow-visualy-accent-4/20"
                                    >
                                        {processing ? 'Ukládám...' : 'Uložit změny'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
