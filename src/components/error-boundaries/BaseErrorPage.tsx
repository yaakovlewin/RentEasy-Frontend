'use client';

import { ReactNode } from 'react';

import Link from 'next/link';

import { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface ErrorAction {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export interface BaseErrorPageProps {
  error?: Error & { digest?: string };
  reset?: () => void;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
  gradient?: string;
  suggestions?: string[];
  actions: ErrorAction[];
  secondaryActions?: ErrorAction[];
  footer?: ReactNode;
  quickLinks?: Array<{ href: string; label: string; icon?: LucideIcon }>;
  helpText?: string;
  showDevDetails?: boolean;
  containerClassName?: string;
  variant?: 'default' | 'full-page';
}

export default function BaseErrorPage({
  error,
  reset,
  title,
  description,
  icon: Icon,
  iconClassName = 'w-8 h-8 text-red-500',
  iconBgClassName = 'w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6',
  gradient = 'from-gray-50 to-gray-100',
  suggestions,
  actions,
  secondaryActions,
  footer,
  quickLinks,
  helpText,
  showDevDetails = true,
  containerClassName = 'max-w-lg',
  variant = 'default',
}: BaseErrorPageProps) {
  const isFullPage = variant === 'full-page';

  const content = (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${gradient} px-4`}>
      <div className={`${containerClassName} w-full`}>
        {!isFullPage && (
          <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
            <div className={iconBgClassName}>
              <Icon className={iconClassName} />
            </div>

            <h1 className='text-2xl font-bold text-gray-900 mb-3'>{title}</h1>

            <p className='text-gray-600 mb-6 leading-relaxed'>{description}</p>

            {suggestions && suggestions.length > 0 && (
              <div className='bg-gray-50 rounded-lg p-4 mb-6 text-left'>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  {suggestions.length === 1 ? 'Here\'s what you can try:' : 'What you can try:'}
                </h3>
                <ul className='text-sm text-gray-600 space-y-1'>
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {showDevDetails && error && process.env.NODE_ENV === 'development' && (
              <details className='mb-6 p-4 bg-red-50 rounded-lg text-left border'>
                <summary className='cursor-pointer font-medium text-red-700 mb-3'>
                  Development Error Details
                </summary>
                <div className='text-sm text-red-600 space-y-3'>
                  <div>
                    <strong>Error:</strong> {error.message}
                  </div>
                  {error.digest && (
                    <div>
                      <strong>Error ID:</strong> {error.digest}
                    </div>
                  )}
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className='whitespace-pre-wrap text-xs bg-red-100 p-3 rounded mt-1 overflow-auto max-h-40 font-mono'>
                      {error.stack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            <div className='flex flex-col sm:flex-row gap-3'>
              {actions.map((action, index) => {
                const ActionButton = (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    onClick={action.onClick || (reset && index === 0 ? reset : undefined)}
                    className={`gap-2 flex-1 ${action.className || ''}`}
                  >
                    <action.icon className='w-4 h-4' />
                    {action.label}
                  </Button>
                );

                return action.href ? (
                  <Link key={index} href={action.href} className='flex-1'>
                    {ActionButton}
                  </Link>
                ) : (
                  ActionButton
                );
              })}
            </div>

            {secondaryActions && secondaryActions.length > 0 && (
              <div className='mt-4 flex flex-col sm:flex-row gap-2'>
                {secondaryActions.map((action, index) => {
                  const SecondaryButton = (
                    <Button
                      key={index}
                      variant={action.variant || 'ghost'}
                      onClick={action.onClick}
                      className={`gap-2 ${action.className || ''}`}
                    >
                      <action.icon className='w-4 h-4' />
                      {action.label}
                    </Button>
                  );

                  return action.href ? (
                    <Link key={index} href={action.href}>
                      {SecondaryButton}
                    </Link>
                  ) : (
                    SecondaryButton
                  );
                })}
              </div>
            )}

            {helpText && <p className='text-xs text-gray-500 mt-6'>{helpText}</p>}
          </div>
        )}

        {isFullPage && (
          <div className='max-w-md w-full text-center'>
            <div className={iconBgClassName}>
              <Icon className={iconClassName} />
            </div>

            <h1 className='text-3xl font-bold text-gray-900 mb-4'>{title}</h1>

            <p className='text-gray-600 mb-8 leading-relaxed'>{description}</p>

            {showDevDetails && error && process.env.NODE_ENV === 'development' && (
              <details className='mb-8 p-4 bg-red-50 rounded-lg text-left'>
                <summary className='cursor-pointer font-medium text-red-700 mb-2'>
                  Error Details (Development Only)
                </summary>
                <div className='text-sm text-red-600 space-y-2'>
                  <p>
                    <strong>Message:</strong> {error.message}
                  </p>
                  {error.digest && (
                    <p>
                      <strong>Digest:</strong> {error.digest}
                    </p>
                  )}
                  <pre className='whitespace-pre-wrap text-xs bg-red-100 p-2 rounded mt-2 overflow-auto max-h-32'>
                    {error.stack}
                  </pre>
                </div>
              </details>
            )}

            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              {actions.map((action, index) => {
                const ActionButton = (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    onClick={action.onClick || (reset && index === 0 ? reset : undefined)}
                    className={`gap-2 ${action.className || ''}`}
                  >
                    <action.icon className='w-4 h-4' />
                    {action.label}
                  </Button>
                );

                return action.href ? (
                  <Link key={index} href={action.href}>
                    {ActionButton}
                  </Link>
                ) : (
                  ActionButton
                );
              })}
            </div>

            {footer && (
              <div className='mt-12 pt-8 border-t border-gray-200'>
                {footer}
              </div>
            )}
          </div>
        )}

        {quickLinks && quickLinks.length > 0 && (
          <div className='mt-8 text-center'>
            <p className='text-sm text-gray-600 mb-3'>Popular pages:</p>
            <div className='flex flex-wrap justify-center gap-2'>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className='text-xs text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-1'
                >
                  {link.icon && <link.icon className='w-3 h-3' />}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {footer && !isFullPage && (
          <div className='text-center mt-6'>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return isFullPage ? (
    <html>
      <body>{content}</body>
    </html>
  ) : (
    content
  );
}
