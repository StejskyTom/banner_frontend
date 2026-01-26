'use client';
import { useState } from 'react';
import Link from 'next/link';
import ContentEditable from './WidgetContentEditable';

export default function CarouselPreview({
    carousel,
    settings,
    onUpdate,
    isEditing = false,
}) {
    const [isPaused, setIsPaused] = useState(false);

    if (!carousel?.attachments?.length) return null;

    // Duplicate enough times to ensure seamless infinite scroll
    const duplicatedAttachments = [...carousel.attachments, ...carousel.attachments];

    const handleMouseEnter = () => {
        if (carousel.pauseOnHover) {
            setIsPaused(true);
        }
    };

    const handleMouseLeave = () => {
        if (carousel.pauseOnHover) {
            setIsPaused(false);
        }
    };

    const updateSettings = (key, value) => {
        onUpdate({ settings: { ...settings, [key]: value } });
    };

    // Calculate duration
    const speed = carousel.speed ?? 20;
    const duration = (duplicatedAttachments.length * speed) / 10;

    const titleStyle = {
        color: settings?.titleColor || '#000000',
        fontFamily: settings?.titleFont || 'sans-serif',
        fontSize: settings?.titleSize || '24px',
        fontWeight: settings?.titleBold ? 'bold' : 'normal',
        fontStyle: settings?.titleItalic ? 'italic' : 'normal',
        textAlign: settings?.titleAlign || 'center',
        margin: '0 0 12px',
    };

    const subtitleStyle = {
        color: settings?.subtitleColor || '#666666',
        fontFamily: settings?.subtitleFont || 'sans-serif',
        fontSize: settings?.subtitleSize || '16px',
        fontWeight: settings?.subtitleBold ? 'bold' : 'normal',
        fontStyle: settings?.subtitleItalic ? 'italic' : 'normal',
        textAlign: settings?.subtitleAlign || 'center',
        margin: '0 0 24px',
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="w-full space-y-2">
                {isEditing ? (
                    <>
                        <div style={{ textAlign: settings?.titleAlign || 'center' }}>
                            <ContentEditable
                                id="editable-title"
                                html={carousel.title || ''}
                                tagName={settings?.titleTag || 'h2'}
                                onChange={(val) => onUpdate({ title: val })}
                                className="outline-none focus:ring-2 focus:ring-visualy-accent-4 rounded p-2 border border-transparent hover:border-gray-200"
                                style={titleStyle}
                            />
                        </div>
                        <div style={{ textAlign: settings?.subtitleAlign || 'center' }}>
                            <ContentEditable
                                id="editable-subtitle"
                                html={settings?.subtitleText || ''}
                                tagName={settings?.subtitleTag || 'p'}
                                onChange={(val) => updateSettings('subtitleText', val)}
                                className="outline-none focus:ring-2 focus:ring-visualy-accent-4 rounded p-2 border border-transparent hover:border-gray-200"
                                style={subtitleStyle}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Non-editing view (production) logic would go here, identical to editing but static */}
                        {/* Reuse logic or component for consistency */}
                    </>
                )}
            </div>

            <div
                className="bnnr_logo_carousel relative w-full overflow-hidden"
                style={{
                    maskImage: `linear-gradient(to right, transparent 0, #000 128px, #000 calc(100% - 128px), transparent 100%)`,
                    WebkitMaskImage: `linear-gradient(to right, transparent 0, #000 128px, #000 calc(100% - 128px), transparent 100%)`
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <ul
                    className="bnnr_logo_strip flex w-max items-center"
                    style={{
                        gap: `${carousel.gap ?? 32}px`,
                        animationName: 'scroll',
                        animationDuration: `${duration}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                >
                    {duplicatedAttachments.map((logo, index) => (
                        <li key={`${logo.id}-${index}`} className="flex-shrink-0">
                            {logo.link ? (
                                <a href={logo.link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-100 transition-opacity opacity-85">
                                    <img
                                        src={logo.url}
                                        alt={logo.alt || ''}
                                        style={{ height: `${carousel.imageSize ?? 64}px`, maxWidth: '120px', objectFit: 'contain' }}
                                        draggable="false"
                                    />
                                </a>
                            ) : (
                                <img
                                    src={logo.url}
                                    alt={logo.alt || ''}
                                    className="block hover:opacity-100 transition-opacity opacity-85"
                                    style={{ height: `${carousel.imageSize ?? 64}px`, maxWidth: '120px', objectFit: 'contain' }}
                                    draggable="false"
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <style jsx global>{`
                @keyframes scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}</style>
        </div >
    );
}
