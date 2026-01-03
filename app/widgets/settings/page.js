'use client';

import { useState, useEffect } from 'react';
import { authorizedFetch } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { CheckCircleIcon, XCircleIcon, CreditCardIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('billing');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Billing State
    const [billing, setBilling] = useState({
        name: '', ico: '', dic: '', street: '', city: '', zip: '', country: 'CZ'
    });

    // Invoices State
    const [invoices, setInvoices] = useState([]);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Derived State for Pagination
    const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);
    const paginatedInvoices = invoices.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const showNotification = useToast();

    // ... (rest of code)

    // Helper for pagination controls (can be inline or function)
    const PaginationControls = () => (
        totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Předchozí
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Strana {page} z {totalPages}
                </span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Další
                </button>
            </div>
        )
    );

    // ... inside render Active Table ...
    // {paginatedInvoices.map(...)}
    // <PaginationControls />

    // ... inside render Inactive Table ...
    // {paginatedInvoices.map(...)}
    // <PaginationControls />

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await authorizedFetch('/subscription', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
                if (data.billing) {
                    setBilling(prev => ({ ...prev, ...data.billing }));
                }
                if (data.invoices) {
                    setInvoices(data.invoices);
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
            showNotification('Nepodařilo se načíst nastavení', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBilling = async () => {
        setProcessing(true);
        try {
            const res = await authorizedFetch('/subscription/billing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billing })
            });

            if (res.ok) {
                showNotification('Fakturační údaje byly uloženy', 'success');
            } else {
                showNotification('Chyba při ukládání údajů', 'error');
            }
        } catch (e) {
            showNotification('Chyba komunikace se serverem', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleSubscribe = async () => {
        if (!billing.name || !billing.street || !billing.city) {
            showNotification('Pro aktivaci je nutné vyplnit fakturační údaje v záložce "Fakturační údaje".', 'error');
            setActiveTab('billing');
            return;
        }

        setProcessing(true);
        try {
            const res = await authorizedFetch('/subscription/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: 'monthly',
                    billing: billing // Ensure we pass latest billing even if saved
                })
            });

            if (res.ok) {
                showNotification('Předplatné bylo úspěšně aktivováno!', 'success');
                fetchStatus();
                setActiveTab('subscription'); // Ensure we stay/go to subscription tab to see active status
            } else {
                showNotification('Platba se nezdařila', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Chyba při zpracování platby', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const downloadInvoice = async (id) => {
        showNotification('Stahování faktury...', 'info');
        try {
            const res = await authorizedFetch(`/subscription/invoice/${id}`);
            if (!res.ok) throw new Error('Failed to download invoice');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            // Direct Download
            const a = document.createElement('a');
            a.href = url;
            a.download = `faktura-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            showNotification('Chyba při stahování faktury', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-visualy-accent-4/30 border-t-visualy-accent-4 rounded-full animate-spin"></div>
            </div>
        );
    }

    const isActive = status?.status === 'active';
    const expiresDate = status?.currentPeriodEnd ? new Date(status.currentPeriodEnd).toLocaleDateString('cs-CZ') : null;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Nastavení účtu</h1>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                <button
                    onClick={() => setActiveTab('billing')}
                    className={`pb-4 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'billing'
                        ? 'border-visualy-accent-4 text-visualy-accent-4'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    <UserIcon className="w-5 h-5" />
                    Fakturační údaje
                </button>
                <button
                    onClick={() => setActiveTab('subscription')}
                    className={`pb-4 px-4 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'subscription'
                        ? 'border-visualy-accent-4 text-visualy-accent-4'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    <CreditCardIcon className="w-5 h-5" />
                    Správa předplatného
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'billing' && (
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
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IČO</label>
                                    <input
                                        type="text"
                                        value={billing.ico || ''}
                                        onChange={e => setBilling({ ...billing, ico: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DIČ</label>
                                    <input
                                        type="text"
                                        value={billing.dic || ''}
                                        onChange={e => setBilling({ ...billing, dic: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                                    />
                                </div>

                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ulice a číslo popisné</label>
                                    <input
                                        type="text"
                                        value={billing.street || ''}
                                        onChange={e => setBilling({ ...billing, street: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Město</label>
                                    <input
                                        type="text"
                                        value={billing.city || ''}
                                        onChange={e => setBilling({ ...billing, city: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PSČ</label>
                                    <input
                                        type="text"
                                        value={billing.zip || ''}
                                        onChange={e => setBilling({ ...billing, zip: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                                    />
                                </div>

                                <div className="lg:col-span-2 pt-4 flex justify-end">
                                    <button
                                        onClick={handleSaveBilling}
                                        disabled={processing}
                                        className="px-6 py-2 bg-visualy-accent-4 text-white rounded-lg hover:bg-visualy-accent-4/90 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? 'Ukládám...' : 'Uložit změny'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'subscription' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Status */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 h-full">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Stav předplatného</h2>
                                <div className="flex items-center gap-4 mb-8">
                                    {isActive ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Aktivní
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-medium">
                                            <XCircleIcon className="w-5 h-5" />
                                            Neaktivní
                                        </div>
                                    )}
                                </div>

                                {isActive ? (
                                    <div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Plán</span>
                                            <span className="font-medium text-gray-900 dark:text-white">Měsíční předplatné</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Cena</span>
                                            <span className="font-medium text-gray-900 dark:text-white">550 Kč / měsíc</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-gray-500 dark:text-gray-400">Platnost do</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{expiresDate}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                                            Váš účet běží v omezeném režimu. Pro plný přístup aktivujte předplatné.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Invoices (if active) OR Buy Card (if inactive) */}
                            {isActive ? (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-full overflow-hidden flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Historie plateb</h3>
                                    {invoices.length > 0 ? (
                                        <div className="flex-1 flex flex-col">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 uppercase">
                                                            <th className="py-3">Číslo</th>
                                                            <th className="py-3">Datum</th>
                                                            <th className="py-3">Částka</th>
                                                            <th className="py-3 text-right">Akce</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-sm">
                                                        {paginatedInvoices.map((inv) => (
                                                            <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-700">
                                                                <td className="py-3 font-medium dark:text-white">{inv.number}</td>
                                                                <td className="py-3 text-gray-500">{new Date(inv.date).toLocaleDateString('cs-CZ')}</td>
                                                                <td className="py-3 font-medium dark:text-white">{inv.amount} {inv.currency}</td>
                                                                <td className="py-3 text-right">
                                                                    <button
                                                                        onClick={() => downloadInvoice(inv.id)}
                                                                        className="text-visualy-accent-4 hover:text-visualy-accent-4/80 text-xs font-medium"
                                                                    >
                                                                        Stáhnout
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <PaginationControls />
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center text-center">
                                            <p className="text-gray-500 text-sm">Zatím žádné faktury.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-8 text-white border border-gray-800 h-full">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <CreditCardIcon className="w-64 h-64 transform rotate-12 translate-x-8 -translate-y-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 relative z-10">Aktivovat Premium</h3>
                                    <div className="flex items-baseline gap-1 mb-6 relative z-10">
                                        <span className="text-4xl font-bold text-white">550 Kč</span>
                                        <span className="text-gray-400">/ měsíc</span>
                                    </div>
                                    <ul className="space-y-3 mb-8 relative z-10">
                                        {['Neomezené widgety', 'Všechny funkce', 'Prioritní podpora'].map((f, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                                <CheckCircleIcon className="w-5 h-5 text-visualy-accent-4" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={processing}
                                        className="w-full relative z-10 py-3 rounded-xl bg-visualy-accent-4 hover:bg-visualy-accent-4/90 text-white font-bold transition-all shadow-lg shadow-visualy-accent-4/25"
                                    >
                                        {processing ? 'Zpracování...' : 'Aktivovat nyní'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bottom Invoices - ONLY if inactive and has history */}
                        {!isActive && invoices.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Historie plateb a faktury</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 uppercase">
                                                <th className="py-3">Číslo</th>
                                                <th className="py-3">Datum</th>
                                                <th className="py-3">Částka</th>
                                                <th className="py-3 text-right">Akce</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {paginatedInvoices.map((inv) => (
                                                <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-700">
                                                    <td className="py-3 font-medium dark:text-white">{inv.number}</td>
                                                    <td className="py-3 text-gray-500">{new Date(inv.date).toLocaleDateString('cs-CZ')}</td>
                                                    <td className="py-3 font-medium dark:text-white">{inv.amount} {inv.currency}</td>
                                                    <td className="py-3 text-right">
                                                        <button
                                                            onClick={() => downloadInvoice(inv.id)}
                                                            className="text-visualy-accent-4 hover:text-visualy-accent-4/80 text-xs font-medium"
                                                        >
                                                            Stáhnout
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <PaginationControls />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
