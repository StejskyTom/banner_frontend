'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authorizedFetch } from '../../../../lib/api';
import { useToast } from "../../../components/ToastProvider";
import {
    CodeBracketIcon,
    ClipboardDocumentIcon,
    XMarkIcon,
    ArrowLeftIcon,
    TableCellsIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/solid';
import Loader from '../../../components/Loader';
import FaqEditSidebar from '../../../components/FaqEditSidebar';
import FaqPreview from '../../../components/FaqPreview';

export default function FaqWidgetDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [widget, setWidget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [isDirty, setIsDirty] = useState(false);

    const showNotification = useToast();

    useEffect(() => {
        if (id) {
            fetchWidget();
        }
    }, [id]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const fetchWidget = async () => {
        try {
            const res = await authorizedFetch(`/faq-widgets/${id}`);
            if (res?.ok) {
                const data = await res.json();
                // Ensure every question has an ID
                const questionsWithIds = (data.questions || []).map(q => ({
                    ...q,
                    id: q.id || crypto.randomUUID()
                }));
                setWidget({ ...data, questions: questionsWithIds });
                setIsDirty(false);
            } else {
                showNotification('Nepodařilo se načíst widget', 'error');
            }
        } catch (error) {
            showNotification('Chyba při načítání widgetu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateWidget = (newWidget) => {
        setWidget(newWidget);
        setIsDirty(true);
    };

    const handleBack = (e) => {
        e.preventDefault();
        if (isDirty) {
            if (window.confirm('Máte neuložené změny. Opravdu chcete odejít?')) {
                router.push('/widgets/faq');
            }
        } else {
            router.push('/widgets/faq');
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await authorizedFetch(`/faq-widgets/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: widget.name,
                    questions: widget.questions,
                    font: widget.font,
                    questionColor: widget.questionColor,
                    answerColor: widget.answerColor,
                    hoverColor: widget.hoverColor,
                    backgroundColor: widget.backgroundColor,
                    // Question styling
                    questionTag: widget.questionTag,
                    questionSize: widget.questionSize,
                    questionFont: widget.questionFont,
                    questionBold: widget.questionBold,
                    questionItalic: widget.questionItalic,
                    questionAlign: widget.questionAlign,
                    questionMarginBottom: widget.questionMarginBottom,
                    // Answer styling
                    answerTag: widget.answerTag,
                    answerSize: widget.answerSize,
                    answerFont: widget.answerFont,
                    answerBold: widget.answerBold,
                    answerItalic: widget.answerItalic,
                    answerAlign: widget.answerAlign,
                    answerMarginBottom: widget.answerMarginBottom,
                    // Arrow settings
                    arrowPosition: widget.arrowPosition,
                    arrowColor: widget.arrowColor,
                    arrowSize: widget.arrowSize,
                    // Border settings
                    borderEnabled: widget.borderEnabled,
                    borderColor: widget.borderColor,
                    borderWidth: widget.borderWidth,
                    borderRadius: widget.borderRadius,
                    // Divider settings
                    dividerEnabled: widget.dividerEnabled,
                    dividerColor: widget.dividerColor,
                    dividerWidth: widget.dividerWidth,
                    dividerHeight: widget.dividerHeight,
                    dividerStyle: widget.dividerStyle,
                    dividerMargin: widget.dividerMargin,
                    // Title settings
                    titleTag: widget.titleTag,
                    titleColor: widget.titleColor,
                    titleSize: widget.titleSize,
                    titleFont: widget.titleFont,
                    titleBold: widget.titleBold,
                    titleItalic: widget.titleItalic,
                    titleAlign: widget.titleAlign,
                    titleMarginBottom: widget.titleMarginBottom,
                    // Subtitle settings
                    subtitleText: widget.subtitleText,
                    subtitleTag: widget.subtitleTag,
                    subtitleColor: widget.subtitleColor,
                    subtitleSize: widget.subtitleSize,
                    subtitleFont: widget.subtitleFont,
                    subtitleBold: widget.subtitleBold,
                    subtitleItalic: widget.subtitleItalic,
                    subtitleAlign: widget.subtitleAlign,
                    subtitleMarginBottom: widget.subtitleMarginBottom
                })
            });

            if (res?.ok) {
                const updatedWidget = await res.json();
                // Preserve local IDs if backend replaces them or returns different structure
                // But usually we want to sync with backend. 
                // Let's re-apply IDs if missing to be safe for UI.
                const questionsWithIds = (updatedWidget.questions || []).map(q => ({
                    ...q,
                    id: q.id || crypto.randomUUID()
                }));
                setWidget({ ...updatedWidget, questions: questionsWithIds });
                setIsDirty(false);
                showNotification('Změny uloženy', 'success');
            } else {
                showNotification('Nepodařilo se uložit změny', 'error');
            }
        } catch (error) {
            showNotification('Chyba při ukládání', 'error');
        } finally {
            setSaving(false);
        }
    };

    const generateEmbedCode = () => {
        const embedUrl = `${process.env.NEXT_PUBLIC_API_URL}/faq-widgets/${id}/embed.js`;
        return `<script src="${embedUrl}" defer></script>`;
    };

    const copyEmbedCode = () => {
        navigator.clipboard.writeText(generateEmbedCode());
        showNotification('Kód zkopírován do schránky', 'success');
    };

    if (loading) return <Loader />;
    if (!widget) return <div className="p-8 text-center">Widget nenalezen</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Bar */}
            <div className="h-16 bg-gray-900 border-b border-gray-800 flex justify-between items-center px-6 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-semibold text-white truncate max-w-md">
                        {widget.name}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowEmbedModal(true)}
                        className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors font-medium text-sm flex items-center gap-2"
                    >
                        <CodeBracketIcon className="h-4 w-4" />
                        Publikovat
                    </button>

                    <button
                        disabled={saving}
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-visualy-accent-4 text-white hover:bg-visualy-accent-4/90 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    >
                        {saving ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        ) : (
                            "Uložit"
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Icon Sidebar */}
                <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-4 shrink-0 z-20">
                    <div className="group relative flex items-center justify-center w-full">
                        <button
                            onClick={() => setActiveTab(activeTab === 'content' ? null : 'content')}
                            className={`p-3 rounded-xl transition-all duration-200 ${activeTab === 'content'
                                ? 'bg-gray-800 text-white shadow-sm'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <TableCellsIcon className="h-6 w-6 text-visualy-accent-4" />
                        </button>
                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md border border-gray-800 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                            Obsah
                        </div>
                    </div>

                    <div className="group relative flex items-center justify-center w-full">
                        <button
                            onClick={() => setActiveTab(activeTab === 'settings' ? null : 'settings')}
                            className={`p-3 rounded-xl transition-all duration-200 ${activeTab === 'settings'
                                ? 'bg-gray-800 text-white shadow-sm'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Cog6ToothIcon className="h-6 w-6 text-visualy-accent-4" />
                        </button>
                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md border border-gray-800 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                            Nastavení
                        </div>
                    </div>
                </div>

                {/* Secondary Panel (EditSidebar) */}
                <FaqEditSidebar widget={widget} setWidget={updateWidget} activeTab={activeTab} />

                {/* Preview Area */}
                <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="w-full max-w-3xl">
                        <FaqPreview widget={widget} />
                    </div>
                </div>
            </div>

            {/* Embed Code Modal */}
            {showEmbedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Publikovat widget</h2>
                            <button onClick={() => setShowEmbedModal(false)} className="text-gray-400 hover:text-gray-500 cursor-pointer">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Vložte tento kód do vašich stránek tam, kde chcete zobrazit FAQ.
                        </p>

                        <div className="relative">
                            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-all">
                                {generateEmbedCode()}
                            </pre>
                            <button
                                onClick={copyEmbedCode}
                                className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 transition cursor-pointer"
                                title="Zkopírovat"
                            >
                                <ClipboardDocumentIcon className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 mt-2">
                            <em>Před zkopírováním kódu nezapomeňte uložit změny.</em>
                        </p>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowEmbedModal(false)}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                            >
                                Zavřít
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
