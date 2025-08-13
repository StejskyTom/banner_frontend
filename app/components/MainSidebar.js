'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Menu, LogOut } from 'lucide-react';

export default function MainSidebar() {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Logo Carousel',
            href: '/widgets/logo-carousel',
            icon: (
                <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 21"
                >
                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
            ),
        },
    ];

    return (
        <>
            {/* Mobile toggle */}
            <button
                data-drawer-target="logo-sidebar"
                data-drawer-toggle="logo-sidebar"
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 mt-2 ms-3 text-sm rounded-lg sm:hidden text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
                <span className="sr-only">Open sidebar</span>
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar */}
            <aside
                id="logo-sidebar"
                className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 -translate-x-full sm:translate-x-0 bg-gray-900 text-white"
                aria-label="Sidebar"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
                        <img
                            src="https://flowbite.com/docs/images/logo.svg"
                            alt="Logo"
                            className="h-8 w-8"
                        />
                        <span className="text-lg font-semibold">Banner Conf</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <ul className="space-y-1 px-2">
                            {navItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={
                                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-800 hover:text-white ` +
                                                (isActive
                                                    ? 'bg-gray-800 text-white font-medium'
                                                    : 'text-gray-300')
                                            }
                                        >
                      <span className="text-gray-400 group-hover:text-white">
                        {item.icon}
                      </span>
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="px-2 py-4 border-t border-gray-800">
                        <button
                            onClick={() => signOut({ callbackUrl: '/prihlaseni' })}
                            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
                        >
                            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            Odhlásit se
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
