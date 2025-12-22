'use client';

import { useState, useEffect } from 'react';
import { authorizedFetch } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState(null);
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchSubscriptionStatus();
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            const res = await authorizedFetch('/subscription/status');
            if (res.ok) {
                const data = await res.json();
                setSubscription(data);
            }
        } catch (error) {
            console.error('Failed to fetch subscription status', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setProcessing(true);
        try {
            const res = await authorizedFetch('/subscription/subscribe', {
                method: 'POST',
            });

            if (res.ok) {
                const data = await res.json();
                // Refresh status
                await fetchSubscriptionStatus();
                alert('Předplatné bylo úspěšně aktivováno!');
            } else {
                const error = await res.json();
                alert('Chyba při aktivaci předplatného: ' + (error.message || 'Neznámá chyba'));
            }
        } catch (error) {
            console.error('Subscription error', error);
            alert('Došlo k chybě při komunikaci se serverem.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                        Předplatné
                    </h1>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                        Vyberte si plán a začněte vytvářet widgety naplno.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-8 sm:p-10">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Měsíční plán</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">Plný přístup ke všem funkcím</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-bold text-gray-900 dark:text-white">500 Kč</p>
                                <p className="text-gray-500 dark:text-gray-400">/ měsíc</p>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center text-gray-600 dark:text-gray-300">
                                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Neomezený počet widgetů
                            </li>
                            <li className="flex items-center text-gray-600 dark:text-gray-300">
                                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Prioritní podpora
                            </li>
                            <li className="flex items-center text-gray-600 dark:text-gray-300">
                                <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Pokročilé statistiky
                            </li>
                        </ul>

                        {subscription?.active ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                                <p className="text-green-800 dark:text-green-300 font-medium">
                                    Máte aktivní předplatné
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                    Platné do: {new Date(subscription.endDate).toLocaleDateString('cs-CZ')}
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                disabled={processing}
                                className={`w-full py-4 px-8 rounded-xl text-white font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1
                                    ${processing
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                    }`}
                            >
                                {processing ? 'Zpracovávám...' : 'Aktivovat předplatné (Dummy)'}
                            </button>
                        )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-750 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            Toto je testovací verze. Platba nebude skutečně provedena.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
