'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import {
    CreditCardIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentArrowDownIcon,
    SparklesIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from '../../../components/ToastProvider';
import Link from 'next/link';

export default function SettingsSubscriptionPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();

    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);
    const paginatedInvoices = invoices.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const showNotification = useToast();

    // Handle return from payment gateway
    useEffect(() => {
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus) {
            switch (paymentStatus) {
                case 'success':
                    showNotification('Platba proběhla úspěšně! Předplatné bylo aktivováno.', 'success');
                    break;
                case 'cancelled':
                    showNotification('Platba byla zrušena.', 'error');
                    break;
                case 'pending':
                    showNotification('Platba se zpracovává. Stav se brzy aktualizuje.', 'info');
                    break;
                case 'error':
                    showNotification('Při zpracování platby došlo k chybě.', 'error');
                    break;
            }
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await authorizedFetch('/subscription');
            if (res && res.ok) {
                const data = await res.json();
                setStatus(data);
                if (data.invoices) {
                    setInvoices(data.invoices);
                }
            }
        } catch (err) {
            console.error('Failed to fetch subscription', err);
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

            if (res && res.ok) {
                const data = await res.json();
                if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                } else {
                    showNotification('Předplatné bylo aktivováno', 'success');
                    fetchStatus();
                    window.dispatchEvent(new Event('subscription_updated'));
                }
            } else {
                const data = res ? await res.json().catch(() => ({})) : {};
                showNotification(data.error || 'Chyba při vytváření předplatného', 'error');
            }
        } catch (err) {
            showNotification('Nepodařilo se spojit se serverem', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        setShowCancelModal(false);
        setCancelling(true);
        try {
            const res = await authorizedFetch('/subscription/cancel', {
                method: 'POST',
            });

            if (res && res.ok) {
                showNotification('Předplatné bylo zrušeno.', 'success');
                fetchStatus();
                window.dispatchEvent(new Event('subscription_updated'));
            } else {
                showNotification('Nepodařilo se zrušit předplatné.', 'error');
            }
        } catch (err) {
            showNotification('Chyba při rušení předplatného', 'error');
        } finally {
            setCancelling(false);
        }
    };

    const downloadInvoice = async (id) => {
        try {
            const res = await authorizedFetch(`/subscription/invoice/${id}`);
            if (!res || !res.ok) throw new Error('Download failed');

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[40vh]">
                <div className="w-8 h-8 border-4 border-visualy-accent-4/20 border-t-visualy-accent-4 rounded-full animate-spin"></div>
            </div>
        );
    }

    const isActive = status?.status === 'active';
    const isTrial = status?.plan === 'trial';
    const isCancelled = status?.isCancelled;
    const expiresDate = status?.currentPeriodEnd ? new Date(status.currentPeriodEnd).toLocaleDateString('cs-CZ') : '-';

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ─── Status Card ─── */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 h-full overflow-hidden">
                    {/* Top gradient */}
                    {isActive && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-visualy-accent-4 via-visualy-accent-1 to-visualy-accent-3"></div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Stav předplatného</h2>
                        {isActive ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                                <CheckCircleSolid className="w-4 h-4" />
                                {isTrial ? 'Zkušební verze' : 'Aktivní'}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-sm font-medium">
                                <XCircleIcon className="w-4 h-4" />
                                Neaktivní
                            </div>
                        )}
                    </div>

                    {isActive ? (
                        <>
                            <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
                                <div className="flex justify-between items-center py-3.5">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">Plán</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {isTrial ? 'Zkušební verze zdarma' : 'Profi tarif'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3.5">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">Cena</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {isTrial ? 'Zdarma' : '550 Kč / měsíc'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3.5">
                                    <span className="text-gray-500 dark:text-gray-400 text-sm">Platnost do</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{expiresDate}</span>
                                </div>
                                {!isTrial && (
                                    <div className="flex justify-between items-center py-3.5">
                                        <span className="text-gray-500 dark:text-gray-400 text-sm">Opakování</span>
                                        <span className="font-semibold">
                                            {isCancelled ? (
                                                <span className="text-amber-500">Zrušeno</span>
                                            ) : (
                                                <span className="text-green-500">Automatické</span>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {!isTrial && !isCancelled && (
                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        disabled={cancelling}
                                        className="text-sm text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                    >
                                        {cancelling ? 'Zpracování...' : 'Zrušit předplatné'}
                                    </button>
                                </div>
                            )}

                            {isCancelled && (
                                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                                    <div className="flex items-start gap-3">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Zrušeno</p>
                                            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                                Aktivní do {expiresDate}, poté bude deaktivováno.
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/widgets/subscription"
                                        className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-visualy-accent-4 hover:bg-visualy-accent-4/90 rounded-xl transition-all shadow-xl shadow-visualy-accent-4/25"
                                    >
                                        <ArrowPathIcon className="w-4 h-4" />
                                        Obnovit předplatné
                                    </Link>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
                            <p className="text-gray-500 dark:text-gray-400 mb-2">
                                Váš účet běží v omezeném režimu.
                            </p>
                            <p className="text-sm text-gray-400">
                                Pro plný přístup aktivujte předplatné.
                            </p>
                        </div>
                    )}
                </div>

                {/* ─── Right Column ─── */}
                {isActive && !isTrial ? (
                    /* Invoices table for paid users */
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Historie plateb</h3>
                        {invoices.length > 0 ? (
                            <div className="flex flex-col">
                                <div style={{ height: '315px' }} className="overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-400 uppercase tracking-wider">
                                                <th className="py-3 font-medium">Číslo</th>
                                                <th className="py-3 font-medium">Datum</th>
                                                <th className="py-3 font-medium">Částka</th>
                                                <th className="py-3 font-medium text-right">Faktura</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {paginatedInvoices.map((inv) => (
                                                <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                                    <td className="py-3 font-medium dark:text-white">{inv.number}</td>
                                                    <td className="py-3 text-gray-500">{new Date(inv.date).toLocaleDateString('cs-CZ')}</td>
                                                    <td className="py-3 font-medium dark:text-white">{inv.amount} {inv.currency}</td>
                                                    <td className="py-3 text-right">
                                                        <button
                                                            onClick={() => downloadInvoice(inv.id)}
                                                            className="inline-flex items-center gap-1 text-visualy-accent-4 hover:text-visualy-accent-4/80 text-xs font-medium transition-colors"
                                                        >
                                                            <DocumentArrowDownIcon className="w-4 h-4" />
                                                            PDF
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        >
                                            ← Předchozí
                                        </button>
                                        <span className="text-xs text-gray-400">{page} / {totalPages}</span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        >
                                            Další →
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center">
                                <p className="text-gray-400 text-sm">Zatím žádné faktury</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Upgrade CTA for inactive/trial users */
                    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden p-8 text-white h-full border border-gray-800">
                        {/* Decorative elements */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-visualy-accent-4/15 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-visualy-accent-3/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-visualy-accent-4/20 rounded-full text-visualy-accent-1 text-xs font-semibold mb-4">
                                <SparklesIcon className="w-3.5 h-3.5" />
                                DOPORUČENO
                            </div>

                            <h3 className="text-2xl font-bold mb-1">
                                {isTrial ? 'Přejít na Profi tarif' : 'Aktivovat Profi tarif'}
                            </h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-extrabold tracking-tight">550</span>
                                <div className="flex flex-col ml-1">
                                    <span className="text-lg font-semibold text-gray-300">Kč</span>
                                    <span className="text-sm text-gray-400 -mt-1">/ měsíc</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {['Neomezené widgety', 'Pokročilé statistiky', 'Prioritní podpora'].map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <CheckCircleSolid className="w-5 h-5 text-visualy-accent-4 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/widgets/subscription"
                                className="w-full py-3 rounded-xl bg-visualy-accent-4 hover:bg-visualy-accent-4/90 text-white font-bold transition-all shadow-xl shadow-visualy-accent-4/25 flex items-center justify-center gap-2"
                            >
                                Aktivovat nyní
                                <ArrowPathIcon className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── CANCEL CONFIRMATION MODAL ──────────────────── */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowCancelModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
                            <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
                            Zrušit předplatné?
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 leading-relaxed">
                            Vaše předplatné zůstane aktivní do konce aktuálního období
                            {expiresDate && <span className="font-semibold text-gray-700 dark:text-gray-300"> ({expiresDate})</span>}.
                            Po tomto datu bude váš účet přepnut do omezeného režimu.
                        </p>

                        {/* Info box */}
                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/30">
                            <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                                Předplatné můžete kdykoliv znovu aktivovat.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                            >
                                Zpět
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {cancelling ? 'Zpracování...' : 'Ano, zrušit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
