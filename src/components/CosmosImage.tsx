import { useState } from 'react';
import { Orbit } from 'lucide-react';

interface CosmosImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
}

export default function CosmosImage({
  src,
  alt,
  title,
  className = '',
  imgClassName = '',
  loading = 'lazy',
}: CosmosImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0B1121] via-[#0F172A] to-[#17122D] text-slate-400 ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.14),transparent_60%),radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.14),transparent_60%)]" />
        <Orbit className="relative z-10 h-8 w-8 text-sky-400/70" strokeWidth={1.5} />
        {title && (
          <span className="relative z-10 mt-2 max-w-[80%] truncate px-3 text-center text-xs font-medium text-slate-300">
            {title}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#0A0F1E] ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-900 via-[#0E1529] to-slate-900" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </div>
  );
}
