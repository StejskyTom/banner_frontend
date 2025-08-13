'use client';

export default function CarouselPreview({
                                            attachments,
                                            imageSize = 64,
                                            speed = 20,
                                            font = 'Arial',
                                        }) {
    if (!attachments?.length) return null;

    const urls = attachments.map((a) => `${a.url}`);
    const repeated = [...urls, ...urls];

    return (
        <div
            className="w-full max-w-3xl inline-flex flex-nowrap overflow-hidden"
            style={{
                // CSS proměnná pro rychlost animace
                ['--duration']: `${speed}s`,
                fontFamily: font,
                maskImage:
                    'linear-gradient(to right, transparent 0, black 128px, black calc(100% - 200px), transparent 100%)',
                WebkitMaskImage:
                    'linear-gradient(to right, transparent 0, black 128px, black calc(100% - 200px), transparent 100%)',
            }}
        >
            <ul className="flex items-center [&_li]:mx-8 [&_img]:max-w-none marquee">
                {repeated.map((u, i) => (
                    <li key={i}>
                        <img
                            src={u}
                            alt=""
                            className="object-contain"
                            style={{ height: `${imageSize}px` }}
                        />
                    </li>
                ))}
            </ul>

            {/* Druhý pás s posunem v půlce animace pro plynulou smyčku */}
            <ul className="flex items-center [&_li]:mx-8 [&_img]:max-w-none marquee marquee2" aria-hidden="true">
                {repeated.map((u, i) => (
                    <li key={`ghost-${i}`}>
                        <img
                            src={u}
                            alt=""
                            className="object-contain"
                            style={{ height: `${imageSize}px` }}
                        />
                    </li>
                ))}
            </ul>

            <style jsx>{`
        .marquee {
          animation-name: marquee;
          animation-duration: var(--duration);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .marquee2 {
          animation-delay: calc(var(--duration) / -2);
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
        </div>
    );
}
