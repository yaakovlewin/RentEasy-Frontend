/**
 * @fileoverview Auth Layout Background Component
 * 
 * CLIENT COMPONENT providing visual background elements for auth pages.
 * Features subtle animations and modern design elements.
 */

'use client';

/**
 * Background component with subtle visual elements for auth pages
 */
export function AuthLayoutBackground() {
  return (
    <>
      {/* Gradient background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient blob */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        
        {/* Secondary gradient blob */}
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        
        {/* Tertiary gradient blob */}
        <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
      
      {/* Floating elements for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-indigo-400 rounded-full animate-float-delayed opacity-50"></div>
        <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-purple-400 rounded-full animate-float-slow opacity-40"></div>
        
        {/* Floating squares */}
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-300 animate-float-reverse opacity-30 transform rotate-45"></div>
        <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-indigo-300 animate-float-delayed opacity-40 transform rotate-12"></div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-reverse {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-float-reverse {
          animation: float-reverse 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </>
  );
}