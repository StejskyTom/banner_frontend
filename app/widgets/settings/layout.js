'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DocumentTextIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function SettingsLayout({ children }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-[calc(100vh)] bg-gray-50 dark:bg-gray-900">
            {/* Top Bar */}
            <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 shrink-0 z-10">
                <h1 className="text-lg font-semibold text-white">Nastavení</h1>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                        <Link
                            href="/widgets/settings"
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${pathname === '/widgets/settings'
                                    ? 'text-visualy-accent-4 border-visualy-accent-4'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5" />
                                Fakturační údaje
                            </div>
                        </Link>
                        <Link
                            href="/widgets/settings/subscription"
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${pathname === '/widgets/settings/subscription'
                                    ? 'text-visualy-accent-4 border-visualy-accent-4'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <CreditCardIcon className="w-5 h-5" />
                                Správa předplatného
                            </div>
                        </Link>
                    </div>

                    {/* Page Content */}
                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
