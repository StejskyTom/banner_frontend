'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import MainSidebar from '../components/MainSidebar';

export default function SidebarWrapper({ children }) {
    const pathname = usePathname();
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    useEffect(() => {
        const parts = pathname ? pathname.split('/').filter(Boolean) : [];
        if (parts.length > 2 && !parts.includes('settings')) {
            setIsDesktopCollapsed(true);
        } else {
            setIsDesktopCollapsed(false);
        }
    }, [pathname]);

    return (
        <>
            <MainSidebar
                isDesktopCollapsed={isDesktopCollapsed}
                onDesktopToggle={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            />
            <main className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isDesktopCollapsed ? 'sm:ml-0' : 'sm:ml-64'}`}>
                {children}
            </main>
        </>
    );
}
