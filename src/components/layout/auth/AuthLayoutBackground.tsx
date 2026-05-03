/**
 * @fileoverview Auth Layout Background Component
 *
 * CLIENT COMPONENT providing visual background elements for auth pages.
 * Features subtle animations and modern design elements.
 */

'use client';

interface GradientBlob {
  position: string;
  gradient: string;
  animation: string;
}

interface FloatingElement {
  position: string;
  size: string;
  color: string;
  animation: string;
  opacity: string;
  shape: 'circle' | 'square';
  rotation?: string;
}

const GRADIENT_BLOBS: GradientBlob[] = [
  {
    position: '-top-40 -right-40',
    gradient: 'from-blue-400 to-indigo-600',
    animation: 'animate-blob',
  },
  {
    position: '-bottom-40 -left-40',
    gradient: 'from-purple-400 to-pink-600',
    animation: 'animate-blob-delayed-2',
  },
  {
    position: '-top-40 left-1/2 -translate-x-1/2',
    gradient: 'from-yellow-400 to-orange-600',
    animation: 'animate-blob-delayed-4',
  },
];

const FLOATING_ELEMENTS: FloatingElement[] = [
  {
    position: 'top-1/4 left-1/4',
    size: 'w-2 h-2',
    color: 'bg-blue-400',
    animation: 'animate-float',
    opacity: 'opacity-60',
    shape: 'circle',
  },
  {
    position: 'top-3/4 right-1/4',
    size: 'w-1 h-1',
    color: 'bg-indigo-400',
    animation: 'animate-float-delayed',
    opacity: 'opacity-50',
    shape: 'circle',
  },
  {
    position: 'top-1/2 left-3/4',
    size: 'w-3 h-3',
    color: 'bg-purple-400',
    animation: 'animate-float-slow',
    opacity: 'opacity-40',
    shape: 'circle',
  },
  {
    position: 'top-1/3 right-1/3',
    size: 'w-2 h-2',
    color: 'bg-blue-300',
    animation: 'animate-float-reverse',
    opacity: 'opacity-30',
    shape: 'square',
    rotation: 'rotate-45',
  },
  {
    position: 'bottom-1/3 left-1/2',
    size: 'w-1 h-1',
    color: 'bg-indigo-300',
    animation: 'animate-float-delayed',
    opacity: 'opacity-40',
    shape: 'square',
    rotation: 'rotate-12',
  },
];

const GRID_PATTERN_STYLES = {
  backgroundImage: `
    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
  `,
  backgroundSize: '50px 50px',
};

/**
 * Background component with subtle visual elements for auth pages
 */
export function AuthLayoutBackground() {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {GRADIENT_BLOBS.map((blob, index) => (
          <div
            key={`blob-${index}`}
            className={`absolute ${blob.position} w-80 h-80 bg-gradient-to-br ${blob.gradient} rounded-full mix-blend-multiply blur-xl opacity-30 ${blob.animation}`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-5"
          style={GRID_PATTERN_STYLES}
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {FLOATING_ELEMENTS.map((element, index) => (
          <div
            key={`float-${index}`}
            className={`absolute ${element.position} ${element.size} ${element.color} ${element.animation} ${element.opacity} ${element.shape === 'circle' ? 'rounded-full' : ''} ${element.rotation || ''}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </>
  );
}