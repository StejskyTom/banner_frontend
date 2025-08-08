'use client';

export default function CarouselPreview({ attachments }) {
  if (!attachments?.length) return null;

  const urls = attachments.map(a => `${a.url}`);
  const repeated = [...urls, ...urls];

  return (
      <div className="w-full max-w-3xl inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
        <ul className="flex items-center [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
          {repeated.map((u, i) => (
              <li key={i}><img src={u} alt="" className="h-16 object-contain max-w-[120px]" /></li>
          ))}
        </ul>
        <ul className="flex items-center [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true">
          {repeated.map((u, i) => (
              <li key={`ghost-${i}`}><img src={u} alt="" className="h-16 object-contain max-w-[120px]" /></li>
          ))}
        </ul>
      </div>
  );
}
