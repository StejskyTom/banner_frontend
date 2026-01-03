'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    CreditCardIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { unauthorizedFetch, authorizedFetch } from '../../../../lib/api';
import { useToast } from '../../../components/ToastProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
    const { data: session } = useSession();
    const router = useRouter();

    // Subscription State
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Invoices State
    const [invoices, setInvoices] = useState([]);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Derived State for Pagination
    const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);
    const paginatedInvoices = invoices.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const showNotification = useToast();

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await authorizedFetch('/subscription');
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
                // Also set invoices if available
                if (data.invoices) {
                    setInvoices(data.invoices);
                }
            } else {
                setError('Nepodařilo se načíst data');
            }
        } catch (err) {
            setError('Chyba připojení');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setProcessing(true);
        try {
            const res = await authorizedFetch('/subscription/create', {
                method: 'POST',
                body: JSON.stringify({ plan: 'monthly' })
            });

            const data = await res.json();

            if (res.ok && data.gatewayUrl) {
                window.location.href = data.gatewayUrl;
            } else {
                showNotification(data.error || 'Chyba při vytváření předplatného', 'error');
            }
        } catch (err) {
            showNotification('Nepodařilo se spojit se serverem', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const downloadInvoice = async (id) => {
        try {
            const res = await authorizedFetch(`/subscription/invoice/${id}`);
            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `faktura-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            showNotification('Nepodařilo se stáhnout fakturu', 'error');
        }
    };

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-visualy-accent-4"></div>
            </div>
        );
    }

    const isActive = status?.status === 'active';
    const isTrial = status?.plan === 'trial';
    const expiresDate = status?.currentPeriodEnd ? new Date(status.currentPeriodEnd).toLocaleDateString('cs-CZ') : '-';

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
                        <Link href="/widgets/settings" className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent transition-all">
                            <div className="flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5" />
                                Fakturační údaje
                            </div>
                        </Link>
                        <Link href="/widgets/settings/subscription" className="px-6 py-4 text-sm font-medium text-visualy-accent-4 border-b-2 border-visualy-accent-4 transition-all">
                            <div className="flex items-center gap-2">
                                <CreditCardIcon className="w-5 h-5" />
                                Správa předplatného
                            </div>
                        </Link>
                    </div>

                    <div className="space-y-8 animate-fadeIn">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Status */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 h-full">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Stav předplatného</h2>
                                <div className="flex items-center gap-4 mb-8">
                                    {isActive ? (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            {isTrial ? 'Aktivní (Zkušební verze)' : 'Aktivní'}
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
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {isTrial ? 'Zkušební verze zdarma' : 'Měsíční předplatné'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">Cena</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {isTrial ? 'Zdarma' : '550 Kč / měsíc'}
                                            </span>
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

                            {/* Right Column: Invoices (if paid active) OR Buy Card (if inactive or trial) */}
                            {isActive && !isTrial ? (
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
                                    <h3 className="text-2xl font-bold mb-2 relative z-10">
                                        {isTrial ? 'Přejít na Premium' : 'Aktivovat Premium'}
                                    </h3>
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

                        {/* Bottom Invoices - ONLY if inactive OR trial and has history */}
                        {(!isActive || isTrial) && invoices.length > 0 && (
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
                </div>
            </div>
        </div>
    );
}
