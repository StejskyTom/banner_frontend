'use client';

import { useState } from 'react';

export default function CarouselPreview({
                                            attachments,
                                            imageSize = 64,
                                            speed = 20,
                                            font = 'Arial',
                                        }) {
    const [isPaused, setIsPaused] = useState(false);

    if (!attachments?.length) return null;

    // Duplicate enough times to ensure seamless infinite scroll
    // For better performance, we only duplicate twice which is sufficient
    const duplicatedAttachments = [...attachments, ...attachments];

    return (
        <div
            className="w-full max-w-3xl inline-flex flex-nowrap overflow-hidden group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
                ['--duration']: `${speed}s`,
                ['--image-size']: `${imageSize}px`,
                fontFamily: font,
                maskImage:
                    'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 5%, black 15%, black 85%, rgba(0,0,0,0.1) 95%, transparent 100%)',
                WebkitMaskImage:
                    'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.1) 5%, black 15%, black 85%, rgba(0,0,0,0.1) 95%, transparent 100%)',
            }}
        >
            {/* Primary scrolling track */}
            <ul
                className="flex items-center justify-center [&_li]:mx-8 [&_img]:max-w-none animate-scroll"
                style={{
                    animationPlayState: isPaused ? 'paused' : 'running',
                }}
            >
                {duplicatedAttachments.map((attachment, i) => (
                    <li key={`primary-${i}`} className="flex-shrink-0">
                        {attachment.link ? (
                            <a
                                href={attachment.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block transition-opacity hover:opacity-75"
                            >
                                <img
                                    src={attachment.url}
                                    alt=""
                                    className="object-contain select-none"
                                    style={{ height: `${imageSize}px` }}
                                    draggable="false"
                                />
                            </a>
                        ) : (
                            <img
                                src={attachment.url}
                                alt=""
                                className="object-contain select-none"
                                style={{ height: `${imageSize}px` }}
                                draggable="false"
                            />
                        )}
                    </li>
                ))}
            </ul>

            {/* Secondary scrolling track for seamless loop */}
            <ul
                className="flex items-center justify-center [&_li]:mx-8 [&_img]:max-w-none animate-scroll"
                aria-hidden="true"
                style={{
                    animationPlayState: isPaused ? 'paused' : 'running',
                }}
            >
                {duplicatedAttachments.map((attachment, i) => (
                    <li key={`secondary-${i}`} className="flex-shrink-0">
                        {attachment.link ? (
                            <a
                                href={attachment.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block transition-opacity hover:opacity-75"
                            >
                                <img
                                    src={attachment.url}
                                    alt=""
                                    className="object-contain select-none"
                                    style={{ height: `${imageSize}px` }}
                                    draggable="false"
                                />
                            </a>
                        ) : (
                            <img
                                src={attachment.url}
                                alt=""
                                className="object-contain select-none"
                                style={{ height: `${imageSize}px` }}
                                draggable="false"
                            />
                        )}
                    </li>
                ))}
            </ul>

            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(-100%);
                    }
                }

                .animate-scroll {
                    animation: scroll var(--duration) linear infinite;
                    will-change: transform;
                }

                /* Smooth transition when pausing */
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
