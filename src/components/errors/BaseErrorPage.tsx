'use client';

import { useEffect, memo, type FC } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Home, RefreshCw, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ErrorVariant = 'default' | 'dashboard' | 'search' | 'property';

interface QuickLink {
  href: string;
  label: string;
}

interface VariantConfig {
  gradient: string;
  iconBg: string;
  iconColor: string;
  buttonColor: string;
  Icon: LucideIcon;
  title: string;
  message: string;
}

export interface BaseErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: ErrorVariant;
  title?: string;
  message?: string;
  suggestions?: string[];
  Icon?: LucideIcon;
  quickLinks?: QuickLink[];
  onErrorLogged?: (error: Error) => void;
}

interface ErrorIconProps {
  config: VariantConfig;
  Icon?: LucideIcon;
}

interface ErrorDetailsProps {
  error: Error & { digest?: string };
}

interface SuggestionsProps {
  suggestions: string[];
  iconBg: string;
}

interface ActionButtonsProps {
  reset: () => void;
  buttonColor: string;
}

interface QuickLinksProps {
  links: QuickLink[];
}

const VARIANT_CONFIG: Record<ErrorVariant, VariantConfig> = {
  default: {
    gradient: 'from-gray-50 to-gray-100',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    Icon: AlertTriangle,
    title: 'Oops! Something went wrong',
    message: 'We encountered an unexpected error while processing your request. Don\'t worry - we\'ve been notified and are working to fix it.',
  },
  dashboard: {
    gradient: 'from-blue-50 to-indigo-100',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    Icon: AlertTriangle,
    title: 'Dashboard Error',
    message: 'We encountered an issue while loading your dashboard. This might be due to a temporary problem with your account data or settings.',
  },
  search: {
    gradient: 'from-orange-50 to-amber-100',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    buttonColor: 'bg-orange-600 hover:bg-orange-700',
    Icon: AlertTriangle,
    title: 'Search Error',
    message: 'We encountered an issue while searching for properties. This might be due to a temporary problem with our search service or your search criteria.',
  },
  property: {
    gradient: 'from-green-50 to-emerald-100',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
    buttonColor: 'bg-green-600 hover:bg-green-700',
    Icon: AlertTriangle,
    title: 'Property Loading Error',
    message: 'We couldn\'t load this property right now. The property might be temporarily unavailable or there could be a connection issue.',
  },
} as const;

const ErrorIcon = memo<ErrorIconProps>(({ config, Icon }) => {
  const IconComponent = Icon || config.Icon;
  return (
    <div
      className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-6`}
      role="img"
      aria-label="Error icon"
    >
      <IconComponent className={`w-8 h-8 ${config.iconColor}`} aria-hidden="true" />
    </div>
  );
});

ErrorIcon.displayName = 'ErrorIcon';

const ErrorDetails = memo<ErrorDetailsProps>(({ error }) => (
  <details className='mb-6 p-4 bg-red-50 rounded-lg text-left border' role="alert" aria-live="polite">
    <summary className='cursor-pointer font-medium text-red-700 mb-3'>
      Development Error Details
    </summary>
    <div className='text-sm text-red-600 space-y-2'>
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
));

ErrorDetails.displayName = 'ErrorDetails';

const Suggestions = memo<SuggestionsProps>(({ suggestions, iconBg }) => (
  <div className={`${iconBg} rounded-lg p-4 mb-6 text-left`} role="complementary">
    <h3 className='font-semibold text-gray-900 mb-2'>What you can try:</h3>
    <ul className='text-sm text-gray-600 space-y-1' role="list">
      {suggestions.map((suggestion, index) => (
        <li key={index} role="listitem">• {suggestion}</li>
      ))}
    </ul>
  </div>
));

Suggestions.displayName = 'Suggestions';

const ActionButtons = memo<ActionButtonsProps>(({ reset, buttonColor }) => (
  <div className='flex flex-col sm:flex-row gap-3' role="group" aria-label="Error recovery actions">
    <Button
      onClick={reset}
      className={`gap-2 ${buttonColor} flex-1`}
      aria-label="Try again to recover from error"
    >
      <RefreshCw className='w-4 h-4' aria-hidden="true" />
      Try Again
    </Button>

    <Link href='/' className='flex-1'>
      <Button
        variant='outline'
        className='gap-2 w-full'
        aria-label="Return to homepage"
      >
        <Home className='w-4 h-4' aria-hidden="true" />
        Go Home
      </Button>
    </Link>
  </div>
));

ActionButtons.displayName = 'ActionButtons';

const QuickLinks = memo<QuickLinksProps>(({ links }) => (
  <nav className='mt-6 text-center' aria-label="Quick navigation links">
    <p className='text-sm text-gray-600 mb-3'>Or try these pages:</p>
    <div className='flex justify-center gap-2 flex-wrap' role="list">
      {links.map((link) => (
        <Link key={link.href} href={link.href} role="listitem">
          <Button variant='ghost' size='sm' className='text-xs'>
            {link.label}
          </Button>
        </Link>
      ))}
    </div>
  </nav>
));

QuickLinks.displayName = 'QuickLinks';

const BaseErrorPage: FC<BaseErrorPageProps> = ({
  error,
  reset,
  variant = 'default',
  title,
  message,
  suggestions,
  Icon,
  quickLinks,
  onErrorLogged,
}) => {
  const config = VARIANT_CONFIG[variant];
  const errorTitle = title || config.title;
  const errorMessage = message || config.message;
  const backButtonText = variant === 'default' ? 'Go Back' : 'Back to Home';
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    console.error(`${variant} error occurred:`, error);

    onErrorLogged?.(error);

    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { level: 'error', tags: { variant } });
    }
  }, [error, variant, onErrorLogged]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${config.gradient} px-4`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className='max-w-lg w-full'>
        <nav className='mb-6' aria-label="Error page navigation">
          <Link href='/'>
            <Button
              variant='ghost'
              className='gap-2 text-gray-600 hover:text-gray-900'
              aria-label={backButtonText}
            >
              <ArrowLeft className='w-4 h-4' aria-hidden="true" />
              {backButtonText}
            </Button>
          </Link>
        </nav>

        <main className='bg-white rounded-2xl shadow-xl p-8 text-center'>
          <ErrorIcon config={config} Icon={Icon} />

          <h1 className='text-2xl font-bold text-gray-900 mb-3'>
            {errorTitle}
          </h1>

          <p className='text-gray-600 mb-6 leading-relaxed'>
            {errorMessage}
          </p>

          {suggestions && suggestions.length > 0 && (
            <Suggestions suggestions={suggestions} iconBg={config.iconBg} />
          )}

          {isDevelopment && <ErrorDetails error={error} />}

          <ActionButtons reset={reset} buttonColor={config.buttonColor} />

          <p className='text-xs text-gray-500 mt-6'>
            If this problem persists, please contact our support team.
          </p>
        </main>

        {quickLinks && quickLinks.length > 0 ? (
          <QuickLinks links={quickLinks} />
        ) : (
          <footer className='text-center mt-6'>
            <p className='text-sm text-gray-500'>
              Error occurred in RentEasy application
            </p>
          </footer>
        )}
      </div>
    </div>
  );
};

BaseErrorPage.displayName = 'BaseErrorPage';

export default BaseErrorPage;
