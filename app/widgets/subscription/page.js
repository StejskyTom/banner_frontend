'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { authorizedFetch } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import Link from 'next/link';
import {
    CheckCircleIcon,
    XCircleIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ArrowPathIcon,
    CreditCardIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    LockClosedIcon,
    ChevronRightIcon,
    BoltIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const FEATURES = [
    { text: 'Neomezený počet widgetů', icon: SparklesIcon },
    { text: 'Pokročilé statistiky a analytika', icon: BoltIcon },
    { text: 'Prioritní technická podpora', icon: ShieldCheckIcon },
    { text: 'Vlastní branding a nastavení', icon: SparklesIcon },
    { text: 'Export dat a reporty', icon: DocumentArrowDownIcon },
];

function SubscriptionContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [step, setStep] = useState(1); // 1 = overview, 2 = billing, 3 = confirm
    const [billing, setBilling] = useState({
        name: '', ico: '', dic: '', street: '', city: '', zip: '', country: 'CZ'
    });
    const [invoices, setInvoices] = useState([]);
    const [billingErrors, setBillingErrors] = useState({});

    const showNotification = useToast();

    // Handle return from payment gateway
    useEffect(() => {
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus) {
            switch (paymentStatus) {
                case 'success':
                    showNotification('Platba proběhla úspěšně! Vaše předplatné bylo aktivováno.', 'success');
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
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await authorizedFetch('/subscription', { cache: 'no-store' });
            if (res && res.ok) {
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
            console.error('Failed to fetch subscription status', error);
            showNotification('Nepodařilo se načíst stav předplatného', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateBilling = () => {
        const errors = {};
        if (!billing.name?.trim()) errors.name = 'Povinné pole';
        if (!billing.street?.trim()) errors.street = 'Povinné pole';
        if (!billing.city?.trim()) errors.city = 'Povinné pole';
        if (!billing.zip?.trim()) errors.zip = 'Povinné pole';
        setBillingErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProceedToConfirm = () => {
        if (validateBilling()) {
            setStep(3);
        }
    };

    const handleSubscribe = async () => {
        if (!validateBilling()) {
            setStep(2);
            return;
        }

        setProcessing(true);
        try {
            const res = await authorizedFetch('/subscription/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: 'monthly',
                    billing: billing
                })
            });

            if (res && res.ok) {
                const data = await res.json();
                if (data.redirectUrl) {
                    // Redirect to Comgate payment gateway
                    window.location.href = data.redirectUrl;
                } else {
                    showNotification('Předplatné bylo úspěšně aktivováno!', 'success');
                    fetchStatus();
                }
            } else {
                const data = res ? await res.json().catch(() => ({})) : {};
                showNotification(data.error || 'Nepodařilo se vytvořit platbu. Zkuste to prosím znovu.', 'error');
            }
        } catch (error) {
            console.error(error);
            showNotification('Chyba při zpracování platby', 'error');
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
                const data = await res.json();
                showNotification(data.message || 'Předplatné bylo zrušeno.', 'success');
                fetchStatus();
                window.dispatchEvent(new Event('subscription_updated'));
            } else {
                showNotification('Nepodařilo se zrušit předplatné.', 'error');
            }
        } catch (error) {
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-visualy-accent-4/20 border-t-visualy-accent-4 rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-400">Načítání...</p>
                </div>
            </div>
        );
    }

    const isActive = status?.status === 'active';
    const isTrial = status?.plan === 'trial';
    const isCancelled = status?.isCancelled;
    const isPaidActive = isActive && !isTrial && !isCancelled; // Trial and cancelled users should see checkout wizard
    const expiresDate = status?.currentPeriodEnd ? new Date(status.currentPeriodEnd).toLocaleDateString('cs-CZ') : null;

    // ─── ACTIVE SUBSCRIPTION VIEW (only for paid subscribers) ────────────────────
    if (isPaidActive) {
        return (
            <div className="p-8 max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Správa předplatného</h1>
                    <p className="text-gray-500 dark:text-gray-400">Spravujte své předplatné, fakturační údaje a stahujte faktury.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Active Subscription Card */}
                    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-visualy-accent-4 via-visualy-accent-1 to-visualy-accent-3"></div>

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Stav předplatného</h2>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                                <CheckCircleSolid className="w-4 h-4" />
                                Aktivní
                            </div>
                        </div>

                        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
                            <div className="flex justify-between items-center py-4">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Plán</span>
                                <span className="font-semibold text-gray-900 dark:text-white">Profi tarif</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Měsíční platba</span>
                                <span className="font-semibold text-gray-900 dark:text-white">550 Kč</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Platnost do</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{expiresDate}</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-gray-500 dark:text-gray-400 text-sm">Opakování</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {isCancelled ? (
                                        <span className="text-amber-500">Zrušeno</span>
                                    ) : (
                                        <span className="text-green-500">Automatické</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {!isCancelled && (
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
                                        <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Předplatné zrušeno</p>
                                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                            Zůstane aktivní do {expiresDate}. Po tomto datu bude deaktivováno.
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

                    {/* Invoices Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Historie plateb</h3>

                        {invoices.length > 0 ? (
                            <div className="flex-1 overflow-x-auto">
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
                                        {invoices.map((inv) => (
                                            <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                                <td className="py-3 font-medium text-gray-900 dark:text-white">{inv.number || '-'}</td>
                                                <td className="py-3 text-gray-500 dark:text-gray-400">
                                                    {new Date(inv.date).toLocaleDateString('cs-CZ')}
                                                </td>
                                                <td className="py-3 font-medium text-gray-900 dark:text-white">
                                                    {inv.amount} {inv.currency}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button
                                                        onClick={() => downloadInvoice(inv.id)}
                                                        className="inline-flex items-center gap-1.5 text-visualy-accent-4 hover:text-visualy-accent-4/80 font-medium text-xs transition-colors"
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
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-gray-400 text-sm">Zatím žádné faktury</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── CHECKOUT FLOW (Inactive subscription) ────────────────────
    return (
        <div className="p-6 max-w-5xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Aktivujte Profi tarif</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Odemkněte všechny funkce a získejte přístup bez omezení.
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-0 mb-8">
                {[
                    { num: 1, label: 'Přehled' },
                    { num: 2, label: 'Fakturační údaje' },
                    { num: 3, label: 'Potvrzení' },
                ].map((s, i) => (
                    <div key={s.num} className="flex items-center">
                        <button
                            onClick={() => {
                                if (s.num < step || (s.num === 2 && step >= 1) || (s.num === 3 && step >= 2)) {
                                    if (s.num === 3 && !validateBilling()) return;
                                    setStep(s.num);
                                }
                            }}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 ${step === s.num
                                ? 'bg-visualy-accent-4/10 text-visualy-accent-4 font-semibold'
                                : step > s.num
                                    ? 'text-visualy-accent-4/70 cursor-pointer hover:bg-visualy-accent-4/5'
                                    : 'text-gray-400 cursor-default'
                                }`}
                        >
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === s.num
                                ? 'bg-visualy-accent-4 text-white shadow-lg shadow-visualy-accent-4/30'
                                : step > s.num
                                    ? 'bg-visualy-accent-4/20 text-visualy-accent-4'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                }`}>
                                {step > s.num ? <CheckCircleSolid className="w-4 h-4" /> : s.num}
                            </span>
                            <span className="hidden sm:inline text-sm">{s.label}</span>
                        </button>
                        {i < 2 && (
                            <div className={`w-8 sm:w-12 h-0.5 mx-1 rounded transition-colors duration-300 ${step > s.num ? 'bg-visualy-accent-4/40' : 'bg-gray-200 dark:bg-gray-700'
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="transition-all duration-300 flex-1">

                {/* ─── STEP 1: Plan Overview ─── */}
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
                        {/* Plan Card */}
                        <div className="lg:col-span-3 relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden p-8 text-white">
                            {/* Decorative orbs */}
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-visualy-accent-4/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-visualy-accent-3/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-visualy-accent-4/20 rounded-full text-visualy-accent-1 text-xs font-semibold mb-4">
                                    <SparklesIcon className="w-3.5 h-3.5" />
                                    DOPORUČENO
                                </div>

                                <h2 className="text-2xl font-bold mb-1">Profi tarif</h2>
                                <div className="flex items-baseline gap-1.5 mb-8">
                                    <span className="text-5xl font-extrabold tracking-tight">550</span>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-semibold text-gray-300">Kč</span>
                                        <span className="text-sm text-gray-400 -mt-1">/ měsíc</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {FEATURES.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 group">
                                            <div className="w-8 h-8 rounded-lg bg-visualy-accent-4/15 flex items-center justify-center shrink-0 group-hover:bg-visualy-accent-4/25 transition-colors">
                                                <feature.icon className="w-4 h-4 text-visualy-accent-1" />
                                            </div>
                                            <span className="text-gray-300 text-sm">{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full py-3.5 px-6 rounded-xl bg-visualy-accent-4 hover:bg-visualy-accent-4/90 active:scale-[0.98] text-white font-bold transition-all shadow-xl shadow-visualy-accent-4/25 flex items-center justify-center gap-2 text-base"
                                >
                                    Pokračovat k platbě
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Benefits sidebar */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                        <LockClosedIcon className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Bezpečná platba</h4>
                                        <p className="text-xs text-gray-400">Platbu zpracovává Comgate</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Vaše platební údaje jsou zabezpečeny šifrováním a zpracovány certifikovanou platební bránou.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                        <ArrowPathIcon className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Automatické obnovení</h4>
                                        <p className="text-xs text-gray-400">Bez starostí</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Předplatné se automaticky obnoví každý měsíc. Zrušit můžete kdykoli jedním kliknutím.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                        <CreditCardIcon className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Jednoduché zrušení</h4>
                                        <p className="text-xs text-gray-400">Bez závazků</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Zrušení je snadné a okamžité. Služba zůstane aktivní do konce zaplaceného období.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── STEP 2: Billing Details ─── */}
                {step === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
                        {/* Billing Form */}
                        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Fakturační údaje</h2>
                            <p className="text-sm text-gray-400 mb-8">Tyto údaje budou uvedeny na faktuře.</p>

                            <div className="space-y-5">
                                {/* Company / Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                        Firma / Jméno *
                                    </label>
                                    <input
                                        type="text"
                                        value={billing.name || ''}
                                        onChange={e => { setBilling({ ...billing, name: e.target.value }); setBillingErrors(p => ({ ...p, name: null })); }}
                                        className={`w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border outline-none transition-all focus:ring-2 focus:ring-visualy-accent-4/40 ${billingErrors.name ? 'border-red-300 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                                            }`}
                                        placeholder="Visualy s.r.o."
                                    />
                                    {billingErrors.name && <p className="text-xs text-red-500 mt-1">{billingErrors.name}</p>}
                                </div>

                                {/* ICO / DIC */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">IČO</label>
                                        <input
                                            type="text"
                                            value={billing.ico || ''}
                                            onChange={e => setBilling({ ...billing, ico: e.target.value })}
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 outline-none transition-all focus:ring-2 focus:ring-visualy-accent-4/40"
                                            placeholder="12345678"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">DIČ</label>
                                        <input
                                            type="text"
                                            value={billing.dic || ''}
                                            onChange={e => setBilling({ ...billing, dic: e.target.value })}
                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 outline-none transition-all focus:ring-2 focus:ring-visualy-accent-4/40"
                                            placeholder="CZ12345678"
                                        />
                                    </div>
                                </div>

                                {/* Street */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Ulice *</label>
                                    <input
                                        type="text"
                                        value={billing.street || ''}
                                        onChange={e => { setBilling({ ...billing, street: e.target.value }); setBillingErrors(p => ({ ...p, street: null })); }}
                                        className={`w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border outline-none transition-all focus:ring-2 focus:ring-visualy-accent-4/40 ${billingErrors.street ? 'border-red-300 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                                            }`}
                                        placeholder="Hlavní 123"
                                    />
                                    {billingErrors.street && <p className="text-xs text-red-500 mt-1">{billingErrors.street}</p>}
                                </div>

                                {/* City / ZIP */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Město *</label>
                                        <input
                                            type="text"
                                            value={billing.city || ''}
                                            onChange={e => { setBilling({ ...billing, city: e.target.value }); setBillingErrors(p => ({ ...p, city: null })); }}
                                            className={`w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border outline-none transition-all focus:ring-2 focus:ring-visualy-accent-4/40 ${billingErrors.city ? 'border-red-300 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            placeholder="Praha"
                                        />
                                        {billingErrors.city && <p className="text-xs text-red-500 mt-1">{billingErrors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">PSČ *</label>
                                        <input
                                            type="text"
                                            value={billing.zip || ''}
                                            onChange={e => { setBilling({ ...billing, zip: e.target.value }); setBillingErrors(p => ({ ...p, zip: null })); }}
                                            className={`w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border outline-none transition-all focus:ring-2 focus:ring-visualy-accent-4/40 ${billingErrors.zip ? 'border-red-300 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            placeholder="100 00"
                                        />
                                        {billingErrors.zip && <p className="text-xs text-red-500 mt-1">{billingErrors.zip}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                                >
                                    ← Zpět
                                </button>
                                <button
                                    onClick={handleProceedToConfirm}
                                    className="px-8 py-3 rounded-xl bg-visualy-accent-4 hover:bg-visualy-accent-4/90 active:scale-[0.98] text-white font-bold transition-all shadow-lg shadow-visualy-accent-4/20 flex items-center gap-2"
                                >
                                    Pokračovat
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Sidebar — order summary + info */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Order summary */}
                            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
                                <div className="absolute -top-16 -right-16 w-40 h-40 bg-visualy-accent-4/15 rounded-full blur-3xl"></div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Vaše objednávka</h3>
                                <div className="flex items-center justify-between py-3 border-b border-white/10">
                                    <span className="text-gray-300 text-sm">Profi tarif</span>
                                    <span className="font-bold text-lg">550 Kč</span>
                                </div>
                                <div className="flex items-center justify-between py-3 text-sm">
                                    <span className="text-gray-400">Perioda</span>
                                    <span className="text-gray-300">Měsíčně</span>
                                </div>
                            </div>

                            {/* Security info */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                        <LockClosedIcon className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Zabezpečená data</h4>
                                        <p className="text-xs text-gray-400">Vaše údaje jsou v bezpečí</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Fakturační údaje jsou bezpečně uloženy a použity výhradně pro vystavení daňových dokladů.
                                </p>
                            </div>

                            {/* Cancellation info */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                        <ArrowPathIcon className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Kdykoliv zrušíte</h4>
                                        <p className="text-xs text-gray-400">Bez závazků</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Předplatné můžete zrušit jedním kliknutím. Služba zůstane aktivní do konce zaplaceného období.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── STEP 3: Confirmation ─── */}
                {step === 3 && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
                        {/* Main confirmation card */}
                        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {/* Order summary header */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
                                <h2 className="text-xl font-bold mb-4">Shrnutí objednávky</h2>
                                <div className="flex items-center justify-between py-3 border-b border-white/10">
                                    <span className="text-gray-300">Profi tarif — měsíční předplatné</span>
                                    <span className="font-bold text-lg">550 Kč</span>
                                </div>
                                <div className="flex items-center justify-between py-3 text-sm">
                                    <span className="text-gray-400">Opakované platby</span>
                                    <span className="text-gray-300">Měsíčně</span>
                                </div>
                            </div>

                            {/* Billing summary */}
                            <div className="p-8">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Fakturační údaje</h3>
                                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mb-6 text-sm space-y-1">
                                    <p className="font-medium text-gray-900 dark:text-white">{billing.name}</p>
                                    {billing.ico && <p className="text-gray-500">IČO: {billing.ico}</p>}
                                    {billing.dic && <p className="text-gray-500">DIČ: {billing.dic}</p>}
                                    <p className="text-gray-500">{billing.street}</p>
                                    <p className="text-gray-500">{billing.city} {billing.zip}</p>
                                </div>

                                {/* Payment info */}
                                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 mb-8">
                                    <LockClosedIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                                            Budete přesměrováni na platební bránu
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                                            Po kliknutí na tlačítko budete bezpečně přesměrováni na Comgate, kde zadáte platební údaje.
                                        </p>
                                    </div>
                                </div>

                                {/* Consent note */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6 leading-relaxed">
                                    Pokračováním souhlasíte s{' '}
                                    <a href="https://visualy.cz/obchodni-podminky/" target="_blank" rel="noopener noreferrer" className="underline decoration-gray-400 dark:decoration-gray-500 underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">obchodními podmínkami</a>
                                    {' '}a{' '}
                                    <a href="https://visualy.cz/zasady-ochrany-osobnich-udaju/" target="_blank" rel="noopener noreferrer" className="underline decoration-gray-400 dark:decoration-gray-500 underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">zásadami ochrany osobních údajů</a>.
                                </p>

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                                    >
                                        ← Upravit údaje
                                    </button>
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={processing}
                                        className="px-8 py-3.5 rounded-xl bg-visualy-accent-4 hover:bg-visualy-accent-4/90 active:scale-[0.98] text-white font-bold transition-all shadow-xl shadow-visualy-accent-4/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 text-base"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Zpracování...
                                            </>
                                        ) : (
                                            <>
                                                <LockClosedIcon className="w-5 h-5" />
                                                Zaplatit 550 Kč
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar — trust & security */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                        <LockClosedIcon className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Šifrované spojení</h4>
                                        <p className="text-xs text-gray-400">SSL / TLS zabezpečení</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Veškerá komunikace je šifrována a vaše platební údaje nikdy neukládáme.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                        <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">PCI DSS certifikace</h4>
                                        <p className="text-xs text-gray-400">Nejvyšší standard</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Platební brána Comgate splňuje nejvyšší bezpečnostní standardy pro zpracování plateb.
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                        <CreditCardIcon className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Comgate Gateway</h4>
                                        <p className="text-xs text-gray-400">Ověřená platební brána</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Platby zpracovává licencovaná česká platební brána s certifikací ČNB.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Legal footer */}
            <div className="flex items-center justify-center gap-2 mt-auto pt-6 text-xs text-gray-400 dark:text-gray-500">
                <a href="https://visualy.cz/obchodni-podminky/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Obchodní podmínky</a>
                <span>·</span>
                <a href="https://visualy.cz/zasady-ochrany-osobnich-udaju/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Ochrana osobních údajů</a>
            </div>
        </div>
    );
}

export default function SubscriptionPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-visualy-accent-4/20 border-t-visualy-accent-4 rounded-full animate-spin"></div></div>}>
            <SubscriptionContent />
        </Suspense>
    );
}
