'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { authorizedFetch } from '../../lib/api';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    PhotoIcon,
    ShoppingBagIcon,
    QuestionMarkCircleIcon,
    DocumentTextIcon,
    UserCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function GlobalSearch({ variant = 'full' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        logo: [],
        heureka: [],
        faq: [],
        article: [],
        author: [],
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const inputRef = useRef(null);

    // Filtered results
    const filteredResults = {
        logo: results.logo.filter(w => w.name?.toLowerCase().includes(query.toLowerCase()) || w.title?.toLowerCase().includes(query.toLowerCase())),
        heureka: results.heureka.filter(w => w.name?.toLowerCase().includes(query.toLowerCase())),
        faq: results.faq.filter(w => w.name?.toLowerCase().includes(query.toLowerCase())),
        article: results.article.filter(w => w.name?.toLowerCase().includes(query.toLowerCase())),
        author: results.author.filter(w => w.name?.toLowerCase().includes(query.toLowerCase())),
    };

    const hasResults = Object.values(filteredResults).some(arr => arr.length > 0) && query.length > 0;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(open => !open);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && !loading && Object.values(results).every(arr => arr.length === 0)) {
            fetchAllWidgets();
        }
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const fetchAllWidgets = async () => {
        setLoading(true);
        try {
            const [logoRes, heurekaRes, faqRes, articleRes, authorRes] = await Promise.all([
                authorizedFetch('/widgets').then(r => r.ok ? r.json() : []),
                authorizedFetch('/heureka/feeds').then(r => r.ok ? r.json() : []),
                authorizedFetch('/faq-widgets').then(r => r.ok ? r.json() : []),
                authorizedFetch('/article-widgets').then(r => r.ok ? r.json() : []),
                authorizedFetch('/author-widgets').then(r => r.ok ? r.json() : [])
            ]);

            setResults({
                logo: logoRes || [],
                heureka: heurekaRes || [],
                faq: faqRes || [],
                article: articleRes || [],
                author: authorRes || []
            });
        } catch (error) {
            console.error('Failed to fetch widgets for search', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (url) => {
        setIsOpen(false);
        setQuery('');
        router.push(url);
    };

    const handleCreate = async (type) => {
        setLoading(true);
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
                handleSelect(redirectUrl);
            }
        } catch (error) {
            console.error('Error creating widget:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {variant === 'hidden' ? null : variant === 'compact' ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition duration-200"
                    aria-label="Hledat (Cmd+K)"
                    title="Hledat (Cmd+K)"
                >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition duration-200"
                    aria-label="Hledat (Cmd+K)"
                >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <span className="text-sm hidden sm:inline flex-1 text-left">Hledat widget...</span>
                    <span className="text-xs bg-gray-900 border border-gray-700 px-1.5 py-0.5 rounded font-mono hidden lg:inline">⌘K</span>
                </button>
            )}

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

                    <div className="relative w-full max-w-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5 dark:ring-white/10 flex flex-col overflow-hidden animate-zoom-in">
                        <div className="flex items-center px-6 py-5 border-b border-gray-200/80 dark:border-gray-800/80">
                            <MagnifyingGlassIcon className="h-6 w-6 text-visualy-accent-4 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white px-5 py-2 text-2xl font-semibold placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                                placeholder="Hledat nebo vytvořit widget..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {loading && <div className="animate-spin h-5 w-5 border-2 border-visualy-accent-4 border-t-transparent rounded-full mr-4 shrink-0" />}
                            <button onClick={() => setIsOpen(false)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800/80 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2 shrink-0 border border-black/5 dark:border-white/5 shadow-sm">
                                <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline opacity-70">Esc</span>
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[65vh] p-3 pb-4 styled-scrollbar">
                            {query && !hasResults && !loading ? (
                                <div className="py-16 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                                    <MagnifyingGlassIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-lg">Nebyly nalezeny žádné widgety pro <span className="font-semibold text-gray-800 dark:text-gray-200">"{query}"</span></p>
                                </div>
                            ) : null}

                            {(query ? hasResults : true) && (
                                <div className="space-y-6 pt-2">
                                    {/* Existing Results */}
                                    {Object.entries(filteredResults).map(([type, items]) => {
                                        if (items.length === 0 && query) return null;
                                        if (items.length === 0) return null;

                                        let icon, label, baseUrl;
                                        switch (type) {
                                            case 'logo': icon = <PhotoIcon className="h-5 w-5" />; label = 'Logo Carousel'; baseUrl = '/widgets/logo-carousel'; break;
                                            case 'heureka': icon = <ShoppingBagIcon className="h-5 w-5" />; label = 'Produkty Heureka'; baseUrl = '/widgets/heureka'; break;
                                            case 'faq': icon = <QuestionMarkCircleIcon className="h-5 w-5" />; label = 'FAQ Sekce'; baseUrl = '/widgets/faq'; break;
                                            case 'article': icon = <DocumentTextIcon className="h-5 w-5" />; label = 'Články'; baseUrl = '/widgets/article'; break;
                                            case 'author': icon = <UserCircleIcon className="h-5 w-5" />; label = 'Autoři'; baseUrl = '/widgets/author'; break;
                                        }

                                        return (
                                            <div key={type} className="px-1">
                                                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">{label}</div>
                                                <div className="space-y-1">
                                                    {items.slice(0, 5).map(item => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => handleSelect(`${baseUrl}/${item.id}`)}
                                                            className="w-full text-left flex items-center justify-between px-3 py-3 rounded-xl hover:bg-visualy-accent-4 group transition-all duration-200 border border-transparent hover:shadow-md"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-white/20 group-hover:text-white transition-colors shadow-sm">
                                                                    {icon}
                                                                </div>
                                                                <span className="font-medium text-[15px] text-gray-800 dark:text-gray-200 group-hover:text-white truncate">{item.name || item.title || 'Nepojmenovaný widget'}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-400 group-hover:text-white/80 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Otevřít <span className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded font-mono font-medium shadow-sm">↵</span>
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Quick Actions (Create New) */}
                                    {!query && (
                                        <div className="px-1 pt-2">
                                            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-3 flex items-center gap-2">
                                                <span>Rychlé akce</span>
                                                <span className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                {[
                                                    { type: 'article', label: 'Článek', icon: <DocumentTextIcon className="h-6 w-6" /> },
                                                    { type: 'heureka', label: 'Produkt', icon: <ShoppingBagIcon className="h-6 w-6" />, path: '/widgets/heureka?action=create' },
                                                    { type: 'faq', label: 'FAQ', icon: <QuestionMarkCircleIcon className="h-6 w-6" /> },
                                                    { type: 'author', label: 'Autor', icon: <UserCircleIcon className="h-6 w-6" /> },
                                                    { type: 'logo', label: 'Carousel', icon: <PhotoIcon className="h-6 w-6" /> }
                                                ].map(action => (
                                                    <button
                                                        key={action.type}
                                                        onClick={() => action.path ? handleSelect(action.path) : handleCreate(action.type)}
                                                        className="flex flex-col items-center justify-center py-6 px-4 bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl hover:bg-visualy-accent-4 hover:-translate-y-1 group transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:shadow-visualy-accent-4/30"
                                                    >
                                                        <div className="text-gray-400 dark:text-gray-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 mb-4">
                                                            {action.icon}
                                                        </div>
                                                        <span className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 group-hover:text-white">Nový {action.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
