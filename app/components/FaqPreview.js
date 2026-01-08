'use client';

import { useState } from 'react';

function FaqItem({ question, settings }) {
    const [isHovered, setIsHovered] = useState(false);

    const questionStyle = {
        color: isHovered ? (settings.hoverColor || '#4F46E5') : (settings.questionColor || '#111827'),
        fontFamily: settings.font || 'sans-serif',
    };

    const answerStyle = {
        color: settings.answerColor || '#6B7280',
        fontFamily: settings.font || 'sans-serif',
    };

    return (
        <div className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-2 last:pb-0">
            <details className="group">
                <summary
                    className="flex justify-between items-center font-medium cursor-pointer list-none py-2 transition-colors"
                    style={questionStyle}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <h3 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>{question.question || 'Nová otázka'}</h3>
                    <span className="transition-transform duration-200 group-open:rotate-180 flex-shrink-0 ml-4">
                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                </summary>
                <p className="mt-2 pb-2 text-sm leading-relaxed m-0" style={answerStyle}>
                    {question.answer || 'Zde bude odpověď...'}
                </p>
            </details>
        </div>
    );
}

export default function FaqPreview({ widget }) {
    const containerStyle = {
        fontFamily: widget.font || 'sans-serif',
        backgroundColor: widget.backgroundColor || 'transparent',
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 rounded-xl" style={containerStyle}>
            {widget.name && (
                <h2 className="text-2xl font-bold mb-6" style={{ color: widget.questionColor || '#111827' }}>
                    {widget.name}
                </h2>
            )}
            <div className="space-y-2">
                {(widget.questions || []).map((q) => (
                    <FaqItem key={q.id} question={q} settings={widget} />
                ))}
                {(widget.questions || []).length === 0 && (
                    <p className="text-gray-400 text-center py-8 italic">
                        Náhled se zobrazí po přidání otázek.
                    </p>
                )}
            </div>
        </div>
    );
}
