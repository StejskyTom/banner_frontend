'use client';

import { useState, useEffect } from 'react';
import { authorizedFetch } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { CreditCardIcon } from '@heroicons/react/24/outline';

export default function SubscriptionPage() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [billing, setBilling] = useState({
        name: '', ico: '', dic: '', street: '', city: '', zip: '', country: 'CZ'
    });
    const [invoices, setInvoices] = useState([]);

    const showNotification = useToast();

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
            console.error('Failed to fetch subscription status', error);
            showNotification('Nepodařilo se načíst stav předplatného', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        // Validate billing checks if needed
        if (!billing.name || !billing.street || !billing.city) {
            showNotification('Prosím vyplňte fakturační údaje (Firma/Jméno, Ulice, Město)', 'error');
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

            if (res.ok) {
                showNotification('Předplatné bylo úspěšně aktivováno!', 'success');
                fetchStatus();
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

    const handleInitialBillingSave = async () => {
        // Simply calling fetchStatus won't save. Ideally we should have a /user/billing endpoint.
        // But for now, we can rely on Subscribe saving it, or just keep it in state until subscribe.
        // If user wants to just save billing, we can add an endpoint or just ignore for now as 'Subscribe' is the main action.
        showNotification('Údaje uloženy lokálně. Budou použity při aktivaci.', 'success');
    };

    const downloadInvoice = (id) => {
        // Mock download
        showNotification('Stahování faktury...', 'success');
        // In real app: window.open(`/api/invoices/${id}/download`);
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
        <div className="p-8 max-w-6xl mx-auto space-y-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Správa předplatného</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Spravujte své předplatné a fakturační údaje.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 h-fit">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <CreditCardIcon className="w-6 h-6 text-gray-400" />
                        Stav předplatného
                    </h2>

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
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                V současné době nemáte aktivní žádné předplatné.
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Aktivací získáte přístup ke všem funkcím.
                            </p>
                        </div>
                    )}
                </div>

                {/* Offer Card (Only if inactive) or Empty placeholder? */}
                {!isActive ? (
                    <div className="relative bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-8 text-white border border-gray-800">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CreditCardIcon className="w-64 h-64 transform rotate-12 translate-x-8 -translate-y-8" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Profi Tarif</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-white">550 Kč</span>
                                <span className="text-gray-400">/ měsíc</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {[
                                    'Neomezený počet widgetů',
                                    'Prioritní podpora',
                                    'Pokročilé statistiky'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircleIcon className="w-5 h-5 text-visualy-accent-4 shrink-0" />
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={handleSubscribe}
                                disabled={processing}
                                className="w-full py-3 px-6 rounded-xl bg-visualy-accent-4 hover:bg-visualy-accent-4/90 text-white font-semibold transition-all shadow-lg shadow-visualy-accent-4/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? 'Zpracování...' : 'Aktivovat a Zaplatit'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            Děkujeme za využívání našich služeb.
                        </p>
                    </div>
                )}
            </div>

            {/* Billing Details & Invoices Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Billing Form */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Fakturační údaje</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Firma / Jméno</label>
                            <input
                                type="text"
                                value={billing.name || ''}
                                onChange={e => setBilling({ ...billing, name: e.target.value })}
                                className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">IČO</label>
                                <input
                                    type="text"
                                    value={billing.ico || ''}
                                    onChange={e => setBilling({ ...billing, ico: e.target.value })}
                                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">DIČ</label>
                                <input
                                    type="text"
                                    value={billing.dic || ''}
                                    onChange={e => setBilling({ ...billing, dic: e.target.value })}
                                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ulice</label>
                            <input
                                type="text"
                                value={billing.street || ''}
                                onChange={e => setBilling({ ...billing, street: e.target.value })}
                                className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Město</label>
                                <input
                                    type="text"
                                    value={billing.city || ''}
                                    onChange={e => setBilling({ ...billing, city: e.target.value })}
                                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">PSČ</label>
                                <input
                                    type="text"
                                    value={billing.zip || ''}
                                    onChange={e => setBilling({ ...billing, zip: e.target.value })}
                                    className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-visualy-accent-4"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <p className="text-xs text-gray-400">Údaje se automaticky uloží při příští platbě.</p>
                        </div>
                    </div>
                </div>

                {/* Invoices List */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Historie faktur</h3>

                    {invoices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 uppercase">
                                        <th className="py-3 font-medium">Číslo</th>
                                        <th className="py-3 font-medium">Datum</th>
                                        <th className="py-3 font-medium">Částka</th>
                                        <th className="py-3 font-medium">Stav</th>
                                        <th className="py-3 font-medium text-right">Akce</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="py-3 font-medium text-gray-900 dark:text-white">{inv.number || '-'}</td>
                                            <td className="py-3 text-gray-500 dark:text-gray-400">
                                                {new Date(inv.date).toLocaleDateString('cs-CZ')}
                                            </td>
                                            <td className="py-3 font-medium text-gray-900 dark:text-white">
                                                {inv.amount} {inv.currency}
                                            </td>
                                            <td className="py-3">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    Zaplaceno
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <button
                                                    onClick={() => downloadInvoice(inv.id)}
                                                    className="text-visualy-accent-4 hover:text-visualy-accent-4/80 font-medium text-xs"
                                                >
                                                    Stáhnout PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm py-4">
                            Zatím nemáte žádné faktury.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
