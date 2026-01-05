'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { authorizedFetch } from '../../lib/api';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import MainSidebar from '../components/MainSidebar';

export default function SidebarWrapper({ children }) {
    const pathname = usePathname();
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(false);

    useEffect(() => {
        const parts = pathname ? pathname.split('/').filter(Boolean) : [];
        if (parts.length > 2 && !parts.includes('settings')) {
            setIsDesktopCollapsed(true);
        } else {
            setIsDesktopCollapsed(false);
        }

        checkSubscription();
    }, [pathname]);

    useEffect(() => {
        const handleUpdate = () => checkSubscription();
        window.addEventListener('subscription_updated', handleUpdate);
        return () => window.removeEventListener('subscription_updated', handleUpdate);
    }, []);

    const checkSubscription = async () => {
        try {
            const res = await authorizedFetch('/subscription');
            if (res.ok) {
                const data = await res.json();
                if (data.status !== 'active') {
                    setShowSubscriptionBanner(true);
                } else {
                    setShowSubscriptionBanner(false);
                }
            }
        } catch (error) {
            console.error('Failed to check subscription', error);
        }
    };

    return (
        <>
            <MainSidebar
                isDesktopCollapsed={isDesktopCollapsed}
                onDesktopToggle={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            />
            <main className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isDesktopCollapsed ? 'sm:ml-0' : 'sm:ml-64'}`}>
                {showSubscriptionBanner && (
                    <div className="bg-red-600 px-6 py-3 text-white flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 z-20">
                        <div className="flex items-center gap-3 text-sm font-medium">
                            <ExclamationTriangleIcon className="w-6 h-6 shrink-0 text-red-200" />
                            <span>Vaše předplatné není aktivní. Některé funkce mohou být omezeny.</span>
                        </div>
                        <Link
                            href="/widgets/settings/subscription"
                            className="text-sm bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors whitespace-nowrap shadow-sm"
                        >
                            Aktivovat
                        </Link>
                    </div>
                )}
                {children}
            </main>
        </>
    );
}
