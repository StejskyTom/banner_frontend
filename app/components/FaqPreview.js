'use client';

import { useState } from 'react';

function FaqItem({ question, settings, isFirst, isLast }) {
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
        marginTop: 0,
        marginBottom: `${settings.questionMarginBottom ?? 8}px`,
        marginLeft: 0,
        marginRight: 0,
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

    const containerStyle = {
        paddingBottom: '0px',
        marginBottom: '0px',
        paddingTop: isFirst ? '0px' : `${settings.dividerMargin ?? 8}px`,
    };

    const dividerEnabled = settings.dividerEnabled ?? true;
    const dividerStyle = {
        border: 'none',
        height: '0px',
        borderTop: `${settings.dividerHeight || 1}px ${settings.dividerStyle || 'solid'} ${settings.dividerColor || '#e5e7eb'}`,
        backgroundColor: 'transparent',
        width: `${settings.dividerWidth || 100}%`,
        margin: '0 auto',
        marginTop: `${settings.dividerMargin ?? 8}px`,
    };

    return (
        <div style={containerStyle}>
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
            {!isLast && dividerEnabled && <hr style={dividerStyle} />}
        </div>
    );
}

export default function FaqPreview({ widget }) {
    const containerStyle = {
        fontFamily: widget.font || 'sans-serif',
        backgroundColor: widget.backgroundColor || 'transparent',
        border: widget.borderEnabled ? `${widget.borderWidth || 1}px solid ${widget.borderColor || '#e5e7eb'}` : 'none',
        borderRadius: widget.borderRadius ? `${widget.borderRadius}px` : '0px',
    };

    const TitleTag = widget.titleTag || 'h2';
    const titleStyle = {
        color: widget.titleColor || '#111827',
        fontSize: widget.titleSize || '24px',
        fontWeight: widget.titleBold ? 'bold' : 'normal',
        fontStyle: widget.titleItalic ? 'italic' : 'normal',
        fontFamily: widget.titleFont || widget.font || 'sans-serif',
        textAlign: widget.titleAlign || 'center',
        marginBottom: `${widget.titleMarginBottom ?? 12}px`,
        marginTop: 0,
        lineHeight: 1.2
    };

    const SubtitleTag = widget.subtitleTag || 'p';
    const subtitleStyle = {
        color: widget.subtitleColor || '#6B7280',
        fontSize: widget.subtitleSize || '16px',
        fontWeight: widget.subtitleBold ? 'bold' : 'normal',
        fontStyle: widget.subtitleItalic ? 'italic' : 'normal',
        fontFamily: widget.subtitleFont || widget.font || 'sans-serif',
        textAlign: widget.subtitleAlign || 'center',
        marginBottom: `${widget.subtitleMarginBottom ?? 24}px`,
        marginTop: 0,
        lineHeight: 1.5
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 rounded-xl" style={containerStyle}>
            {widget.name && (
                <TitleTag style={titleStyle} className="mb-0">
                    {widget.name}
                </TitleTag>
            )}
            {widget.subtitleText && (
                <SubtitleTag style={subtitleStyle} className="mb-0">
                    {widget.subtitleText}
                </SubtitleTag>
            )}
            <div className="space-y-0">
                {(widget.questions || []).map((q, idx) => (
                    <FaqItem
                        key={q.id}
                        question={q}
                        settings={widget}
                        isFirst={idx === 0}
                        isLast={idx === (widget.questions || []).length - 1}
                    />
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
