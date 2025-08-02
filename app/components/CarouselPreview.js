'use client';

export default function CarouselPreview({ logos }) {
  if (!logos.length) return null;
  const repeatedLogos = [...logos, ...logos];

  return (
    <>   
    <div className="w-full max-w-3xl inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-200px),transparent_100%)]">
    <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
        {repeatedLogos.map((logo, idx) => (
            <li key={idx}>
                <img
                key={idx}
                src={logo}
                alt={`Logo ${idx}`}
                className="h-16 object-contain max-w-[120px]"
                />
            </li>            
          ))}        
    </ul>
    <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true">
        {repeatedLogos.map((logo, idx) => (
            <li key={idx}>
                <img
                key={idx}
                src={logo}
                alt={`Logo ${idx}`}
                className="h-16 object-contain max-w-[120px]"
                />
            </li>            
          ))}
    </ul>
</div>
    </>
  );
}
