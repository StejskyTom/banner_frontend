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
    // Calculate duration
    const speed = carousel.speed ?? 20;
    const enableAnimation = settings?.enableAnimation !== false;
    const attachmentsToRender = enableAnimation ? [...carousel.attachments, ...carousel.attachments] : carousel.attachments;
    const duration = (attachmentsToRender.length * speed) / 10;

    const titleStyle = {
        color: settings?.titleColor || '#000000',
        fontFamily: settings?.titleFont || 'sans-serif',
        fontSize: settings?.titleSize || '24px',
        fontWeight: settings?.titleBold ? 'bold' : 'normal',
        fontStyle: settings?.titleItalic ? 'italic' : 'normal',
        textAlign: settings?.titleAlign || 'center',
        margin: `0 0 ${settings?.titleMarginBottom ?? 12}px`,
    };

    const subtitleStyle = {
        color: settings?.subtitleColor || '#666666',
        fontFamily: settings?.subtitleFont || 'sans-serif',
        fontSize: settings?.subtitleSize || '16px',
        fontWeight: settings?.subtitleBold ? 'bold' : 'normal',
        fontStyle: settings?.subtitleItalic ? 'italic' : 'normal',
        textAlign: settings?.subtitleAlign || 'center',
        margin: `0 0 ${settings?.subtitleMarginBottom ?? 24}px`,
    };

    // Fade Logic
    // If animation is disabled (static grid), disable fade effects as content wraps.
    const fadeEnabled = (settings?.fadeEnabled !== false) && enableAnimation;
    const fadeWidth = settings?.fadeWidth ?? 128;
    const fadeWidthUnit = settings?.fadeWidthUnit ?? 'px';
    const fadeMode = settings?.fadeMode ?? 'mask';
    const fadeColor = settings?.fadeColor || '#ffffff';
    // "Průhlednost" slider: 0 = Solid (Strong Fade), 100 = Invisible (No Fade)
    const fadeTransparency = (settings?.fadeOpacity ?? 0) / 100;

    let maskStyle = {};
    if (fadeEnabled && fadeMode === 'mask') {
        const edgeAlpha = fadeTransparency;
        const widthVal = `${fadeWidth}${fadeWidthUnit}`;
        // Use intersection of two gradients to allow overlapping fades (width > 50%)
        const gradLeft = `linear-gradient(to right, rgba(0,0,0,${edgeAlpha}) 0, #000 ${widthVal}, #000 100%)`;
        const gradRight = `linear-gradient(to left, rgba(0,0,0,${edgeAlpha}) 0, #000 ${widthVal}, #000 100%)`;

        maskStyle = {
            maskImage: `${gradLeft}, ${gradRight}`,
            WebkitMaskImage: `${gradLeft}, ${gradRight}`,
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in'
        };
    }

    const hexToRgba = (hex, alpha) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Image Appearance Settings
    const imgRadius = settings?.imgRadius ?? 0;
    const shadowEnabled = settings?.shadowEnabled || false;
    const shadowColor = settings?.shadowColor || '#000000';
    const shadowBlur = settings?.shadowBlur ?? 10;
    const shadowOpacity = (settings?.shadowOpacity ?? 20) / 100;

    const shadowStyle = shadowEnabled
        ? `0 4px ${shadowBlur}px ${hexToRgba(shadowColor, shadowOpacity)}`
        : 'none';

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
                        {settings?.subtitleText && (
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
                        )}
                    </>
                ) : (
                    <>
                        {carousel.title && (
                            <h2 style={titleStyle}>{carousel.title}</h2>
                        )}
                        {settings?.subtitleText && (
                            <p style={subtitleStyle}>{settings.subtitleText}</p>
                        )}
                    </>
                )}
            </div>

            <div
                className="bnnr_logo_carousel relative w-full overflow-hidden"
                style={maskStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Color Overlays */}
                {fadeEnabled && fadeMode === 'color' && (
                    <>
                        <div
                            className="absolute top-0 bottom-0 left-0 z-10 pointer-events-none"
                            style={{
                                width: `${fadeWidth}${fadeWidthUnit}`,
                                background: `linear-gradient(to right, ${fadeColor}, transparent)`,
                                opacity: 1 - fadeTransparency
                            }}
                        />
                        <div
                            className="absolute top-0 bottom-0 right-0 z-10 pointer-events-none"
                            style={{
                                width: `${fadeWidth}${fadeWidthUnit}`,
                                right: 0,
                                background: `linear-gradient(to left, ${fadeColor}, transparent)`,
                                opacity: 1 - fadeTransparency
                            }}
                        />
                    </>
                )}

                <ul
                    className={`bnnr_logo_strip py-4 flex items-center ${enableAnimation ? 'w-max' : 'w-full flex-wrap justify-center'}`}
                    style={{
                        gap: `${carousel.gap ?? 32}px`,
                        ...(enableAnimation ? {
                            animationName: 'scroll',
                            animationDuration: `${duration}s`,
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite',
                            animationPlayState: isPaused ? 'paused' : 'running',
                        } : {})
                    }}
                >
                    {attachmentsToRender.map((logo, index) => (
                        <li key={`${logo.id}-${index}`} className="flex-shrink-0">
                            {logo.link ? (
                                <a href={logo.link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-100 transition-opacity opacity-85">
                                    <img
                                        src={logo.url}
                                        alt={logo.alt || ''}
                                        style={{
                                            height: `${carousel.imageSize ?? 64}px`,
                                            maxWidth: '120px',
                                            objectFit: 'contain',
                                            borderRadius: `${imgRadius}px`,
                                            boxShadow: shadowStyle
                                        }}
                                        draggable="false"
                                    />
                                </a>
                            ) : (
                                <img
                                    src={logo.url}
                                    alt={logo.alt || ''}
                                    className="block hover:opacity-100 transition-opacity opacity-85"
                                    style={{
                                        height: `${carousel.imageSize ?? 64}px`,
                                        maxWidth: '120px',
                                        objectFit: 'contain',
                                        borderRadius: `${imgRadius}px`,
                                        boxShadow: shadowStyle
                                    }}
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
