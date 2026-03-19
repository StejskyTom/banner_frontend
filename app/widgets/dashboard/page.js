'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ToastProvider';
import { authorizedFetch } from '../../../lib/api';
import {
    PhotoIcon,
    ShoppingBagIcon,
    QuestionMarkCircleIcon,
    DocumentTextIcon,
    UserCircleIcon,
    PlusIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        logo: 0,
        heureka: 0,
        faq: 0,
        article: 0,
        author: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await authorizedFetch('/user/stats');

                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        logo: data.logo || 0,
                        heureka: data.heureka || 0,
                        faq: data.faq || 0,
                        article: data.article || 0,
                        author: data.author || 0
                    });
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchStats();
        }
    }, [session]);

    const cards = [
        {
            title: 'Logo Carousel',
            count: stats.logo,
            icon: PhotoIcon,
            href: '/widgets/logo-carousel',
            color: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            title: 'Produkty',
            count: stats.heureka,
            icon: ShoppingBagIcon,
            href: '/widgets/heureka',
            color: 'text-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            title: 'FAQ Sekce',
            count: stats.faq,
            icon: QuestionMarkCircleIcon,
            href: '/widgets/faq',
            color: 'text-amber-500',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20'
        },
        {
            title: 'Články',
            count: stats.article,
            icon: DocumentTextIcon,
            href: '/widgets/article',
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        {
            title: 'Autoři',
            count: stats.author,
            icon: UserCircleIcon,
            href: '/widgets/author',
            color: 'text-pink-500',
            bgColor: 'bg-pink-50 dark:bg-pink-900/20'
        }
    ];

    const router = useRouter();
    const showNotification = useToast();
    const [creating, setCreating] = useState(null);

    const handleCreate = async (type) => {
        setCreating(type);
        try {
            let endpoint = '';
            let body = {};
            let redirectUrl = '';

            switch (type) {
                case 'logo':
                    endpoint = '/widgets/logo-carousel/new';
                    body = { title: 'Nový carousel' };
                    break;
                case 'faq':
                    endpoint = '/faq-widgets';
                    body = { name: 'Nové FAQ' };
                    break;
                case 'article':
                    endpoint = '/article-widgets';
                    body = { name: 'Nový článek' };
                    break;
                case 'author':
                    endpoint = '/author-widgets';
                    body = { name: 'Nový autor' };
                    break;
                default:
                    return;
            }

            const res = await authorizedFetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const data = await res.json();
                if (type === 'logo') redirectUrl = `/widgets/logo-carousel/${data.id}`;
                else if (type === 'faq') redirectUrl = `/widgets/faq/${data.id}`;
                else if (type === 'article') redirectUrl = `/widgets/article/${data.id}`;
                else if (type === 'author') redirectUrl = `/widgets/author/${data.id}`;

                router.push(redirectUrl);
            } else {
                showNotification({
                    title: 'Nepodařilo se vytvořit widget',
                    description: 'Došlo k chybě při vytváření widgetu.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error creating widget:', error);
            showNotification({
                title: 'Chyba při vytváření widgetu',
                description: 'Zkuste to prosím znovu.',
                variant: 'destructive',
            });
        } finally {
            setCreating(null);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Bar */}
            <div className="h-16 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-6 shrink-0 z-10">
                <h1 className="text-lg font-semibold text-white">
                    Dashboard
                </h1>
                <div className="flex items-center">
                    <button
                        onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition duration-200"
                        title="Hledat (Cmd+K)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Vítejte zpět, {session?.user?.name || 'uživateli'} 👋
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Zde je přehled vašich widgetů a rychlé akce.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {cards.map((card) => (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${card.bgColor} ${card.color}`}>
                                        <card.icon className="w-8 h-8" />
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400 group-hover:text-visualy-accent-4 transition-colors">
                                        <span className="text-sm font-medium">Přejít</span>
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        {card.title}
                                    </h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {loading ? '-' : card.count}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            zobrazení
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Rychlé akce
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <button
                                onClick={() => handleCreate('logo')}
                                disabled={creating === 'logo'}
                                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-visualy-accent-4/50 dark:hover:border-visualy-accent-4/50 transition-all group text-left w-full cursor-pointer disabled:opacity-50"
                            >
                                <div className="p-2 bg-gradient-to-br from-visualy-accent-4 to-emerald-500 rounded-lg text-white shadow-lg shadow-visualy-accent-4/20 group-hover:scale-110 transition-transform duration-300">
                                    {creating === 'logo' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusIcon className="w-5 h-5" />}
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Carousel</span>
                            </button>

                            <Link
                                href="/widgets/heureka?action=create"
                                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-visualy-accent-4/50 dark:hover:border-visualy-accent-4/50 transition-all group"
                            >
                                <div className="p-2 bg-gradient-to-br from-visualy-accent-4 to-emerald-500 rounded-lg text-white shadow-lg shadow-visualy-accent-4/20 group-hover:scale-110 transition-transform duration-300">
                                    <PlusIcon className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Produkt</span>
                            </Link>

                            <button
                                onClick={() => handleCreate('faq')}
                                disabled={creating === 'faq'}
                                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-visualy-accent-4/50 dark:hover:border-visualy-accent-4/50 transition-all group text-left w-full cursor-pointer disabled:opacity-50"
                            >
                                <div className="p-2 bg-gradient-to-br from-visualy-accent-4 to-emerald-500 rounded-lg text-white shadow-lg shadow-visualy-accent-4/20 group-hover:scale-110 transition-transform duration-300">
                                    {creating === 'faq' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusIcon className="w-5 h-5" />}
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">FAQ</span>
                            </button>

                            <button
                                onClick={() => handleCreate('article')}
                                disabled={creating === 'article'}
                                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-visualy-accent-4/50 dark:hover:border-visualy-accent-4/50 transition-all group text-left w-full cursor-pointer disabled:opacity-50"
                            >
                                <div className="p-2 bg-gradient-to-br from-visualy-accent-4 to-emerald-500 rounded-lg text-white shadow-lg shadow-visualy-accent-4/20 group-hover:scale-110 transition-transform duration-300">
                                    {creating === 'article' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusIcon className="w-5 h-5" />}
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Článek</span>
                            </button>

                            <button
                                onClick={() => handleCreate('author')}
                                disabled={creating === 'author'}
                                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-visualy-accent-4/50 dark:hover:border-visualy-accent-4/50 transition-all group text-left w-full cursor-pointer disabled:opacity-50"
                            >
                                <div className="p-2 bg-gradient-to-br from-visualy-accent-4 to-emerald-500 rounded-lg text-white shadow-lg shadow-visualy-accent-4/20 group-hover:scale-110 transition-transform duration-300">
                                    {creating === 'author' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PlusIcon className="w-5 h-5" />}
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Autor</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
