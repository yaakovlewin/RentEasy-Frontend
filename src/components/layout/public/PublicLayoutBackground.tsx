/**
 * @fileoverview Public Layout Background Component
 * 
 * CLIENT COMPONENT providing subtle background elements for public pages.
 * Features marketing-focused design elements and brand consistency.
 */

'use client';

/**
 * Background component with marketing-focused visual elements
 * Fixed z-index issues to prevent interference with interactive elements
 */
export function PublicLayoutBackground() {
  return (
    <>
      {/* Subtle gradient background for brand consistency - Behind everything */}
      <div className="fixed inset-0 pointer-events-none -z-50">
        {/* Primary brand gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30"></div>
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Marketing-focused floating elements - Behind content but above base background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-40">
        {/* Large decorative shapes for visual interest */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-slow-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-slow-float-delayed"></div>
        
        {/* Smaller accent elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-gentle-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-green-100 to-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-25 animate-gentle-float-reverse"></div>
      </div>

      {/* Brand accent lines (very subtle) - Behind main content */}
      <div className="fixed inset-0 pointer-events-none -z-30">
        <div className="absolute top-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent"></div>
        <div className="absolute bottom-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200/50 to-transparent"></div>
      </div>

      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes slow-float {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(20px, -30px) scale(1.05);
          }
          66% {
            transform: translate(-15px, 15px) scale(0.95);
          }
        }

        @keyframes slow-float-delayed {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(-25px, 20px) scale(0.98);
          }
          66% {
            transform: translate(30px, -10px) scale(1.02);
          }
        }

        @keyframes gentle-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes gentle-float-reverse {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(15px);
          }
        }

        .animate-slow-float {
          animation: slow-float 20s ease-in-out infinite;
        }

        .animate-slow-float-delayed {
          animation: slow-float-delayed 25s ease-in-out infinite;
          animation-delay: 5s;
        }

        .animate-gentle-float {
          animation: gentle-float 8s ease-in-out infinite;
        }

        .animate-gentle-float-reverse {
          animation: gentle-float-reverse 10s ease-in-out infinite;
          animation-delay: 3s;
        }
      `}</style>
    </>
  );
}