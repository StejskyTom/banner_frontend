'use client';

import { useState } from 'react';

function FaqItem({ question, settings }) {
    const [isHovered, setIsHovered] = useState(false);

    // Question styling from settings
    const QuestionTag = settings.questionTag || 'h3';
    const questionStyle = {
        color: isHovered ? (settings.hoverColor || '#4F46E5') : (settings.questionColor || '#111827'),
        fontFamily: settings.questionFont || settings.font || 'sans-serif',
        fontSize: settings.questionSize || '18px',
        fontWeight: settings.questionBold !== false ? 'bold' : 'normal',
        fontStyle: settings.questionItalic ? 'italic' : 'normal',
        textAlign: settings.questionAlign || 'left',
        margin: 0,
        flex: 1,
    };

    // Answer styling from settings
    const AnswerTag = settings.answerTag || 'p';
    const answerStyle = {
        color: settings.answerColor || '#6B7280',
        fontFamily: settings.answerFont || settings.font || 'sans-serif',
        fontSize: settings.answerSize || '14px',
        fontWeight: settings.answerBold ? 'bold' : 'normal',
        fontStyle: settings.answerItalic ? 'italic' : 'normal',
        textAlign: settings.answerAlign || 'left',
        marginTop: '8px',
        marginBottom: `${settings.answerMarginBottom ?? 8}px`,
        lineHeight: 1.6,
    };

    // Arrow settings
    const arrowPosition = settings.arrowPosition || 'after';
    const arrowColor = settings.arrowColor || '#6B7280';
    const arrowSize = settings.arrowSize || 24;

    // Summary justify: space-between for right arrow, otherwise flex-start (text handles its own alignment)
    const summaryJustify = arrowPosition === 'right' ? 'space-between' : 'flex-start';

    const ArrowIcon = () => (
        <span
            className="transition-transform duration-200 group-open:rotate-180 flex-shrink-0"
            style={{
                color: arrowColor,
                marginLeft: arrowPosition === 'left' ? 0 : '16px',
                marginRight: arrowPosition === 'left' ? '16px' : 0,
                order: arrowPosition === 'left' ? -1 : 1,
            }}
        >
            <svg fill="none" height={arrowSize} shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width={arrowSize}><path d="M6 9l6 6 6-6"></path></svg>
        </span>
    );

    return (
        <div
            className="border-b border-gray-200 dark:border-gray-700 last:border-0"
            style={{ paddingBottom: `${settings.questionMarginBottom ?? 8}px`, marginBottom: `${settings.questionMarginBottom ?? 8}px` }}
        >
            <details className="group">
                <summary
                    className="flex items-center cursor-pointer list-none py-2 transition-colors"
                    style={{ justifyContent: summaryJustify }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <QuestionTag style={questionStyle}>{question.question || 'Nová otázka'}</QuestionTag>
                    <ArrowIcon />
                </summary>
                <AnswerTag className="leading-relaxed" style={answerStyle}>
                    {question.answer || 'Zde bude odpověď...'}
                </AnswerTag>
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
            <div className="space-y-0">
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
