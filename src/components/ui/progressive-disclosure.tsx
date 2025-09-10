'use client';

import * as React from 'react';

import { ChevronDown, ChevronRight, Eye, EyeOff, Info, Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

// Collapsible/Accordion component with smart defaults
interface CollapsibleProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  variant?: 'default' | 'card' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
}

export function Collapsible({
  trigger,
  children,
  defaultOpen = false,
  onOpenChange,
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  variant = 'default',
  size = 'md',
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const toggleOpen = () => {
    if (disabled) return;
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantClasses = {
    default: 'border border-gray-200 rounded-xl',
    card: 'bg-white border border-gray-200 rounded-xl shadow-sm',
    minimal: 'border-0',
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      <button
        onClick={toggleOpen}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left transition-all focus-smooth',
          'hover:bg-gray-50 focus:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variant === 'minimal' && 'p-2 hover:bg-transparent focus:bg-transparent',
          triggerClassName
        )}
        aria-expanded={isOpen}
        aria-controls='collapsible-content'
      >
        <span className='flex-1'>{trigger}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <div
        id='collapsible-content'
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className={cn('p-4 pt-0', variant === 'minimal' && 'p-2 pt-0', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Show More/Show Less component
interface ShowMoreProps {
  children: React.ReactNode;
  maxLines?: number;
  showMoreText?: string;
  showLessText?: string;
  className?: string;
  buttonClassName?: string;
  characterLimit?: number;
}

export function ShowMore({
  children,
  maxLines = 3,
  showMoreText = 'Show more',
  showLessText = 'Show less',
  className,
  buttonClassName,
  characterLimit,
}: ShowMoreProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [shouldShowButton, setShouldShowButton] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseInt(getComputedStyle(contentRef.current).lineHeight);
      const maxHeight = lineHeight * maxLines;
      const actualHeight = contentRef.current.scrollHeight;

      if (characterLimit) {
        const text = contentRef.current.textContent || '';
        setShouldShowButton(text.length > characterLimit);
      } else {
        setShouldShowButton(actualHeight > maxHeight);
      }
    }
  }, [maxLines, characterLimit]);

  const getDisplayContent = () => {
    if (!characterLimit || isExpanded) return children;

    const text = typeof children === 'string' ? children : '';
    return text.length > characterLimit ? `${text.slice(0, characterLimit)}...` : children;
  };

  return (
    <div className={className}>
      <div
        ref={contentRef}
        className={cn(
          'transition-all duration-300',
          !isExpanded && !characterLimit && `line-clamp-${maxLines}`
        )}
      >
        {getDisplayContent()}
      </div>

      {shouldShowButton && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'mt-2 p-0 h-auto text-primary hover:text-primary/80 font-medium',
            buttonClassName
          )}
        >
          {isExpanded ? showLessText : showMoreText}
        </Button>
      )}
    </div>
  );
}

// Progressive Form Steps
interface ProgressiveStepsProps {
  steps: {
    title: string;
    content: React.ReactNode;
    isComplete?: boolean;
    isOptional?: boolean;
  }[];
  currentStep: number;
  onStepChange: (step: number) => void;
  allowSkipping?: boolean;
  className?: string;
}

export function ProgressiveSteps({
  steps,
  currentStep,
  onStepChange,
  allowSkipping = false,
  className,
}: ProgressiveStepsProps) {
  const canProceedToStep = (stepIndex: number) => {
    if (allowSkipping) return true;

    // Check if all previous required steps are complete
    for (let i = 0; i < stepIndex; i++) {
      if (!steps[i].isOptional && !steps[i].isComplete) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className={className}>
      {/* Step indicator */}
      <div className='flex items-center justify-between mb-8'>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className='flex flex-col items-center'>
              <button
                onClick={() => canProceedToStep(index) && onStepChange(index)}
                disabled={!canProceedToStep(index)}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all focus-smooth',
                  index === currentStep && 'bg-primary text-white shadow-lg scale-110',
                  index < currentStep && step.isComplete && 'bg-green-500 text-white',
                  index < currentStep && !step.isComplete && 'bg-gray-300 text-gray-600',
                  index > currentStep &&
                    canProceedToStep(index) &&
                    'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  index > currentStep &&
                    !canProceedToStep(index) &&
                    'bg-gray-50 text-gray-400 cursor-not-allowed'
                )}
              >
                {step.isComplete && index < currentStep ? (
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center max-w-20',
                  index === currentStep ? 'text-primary' : 'text-gray-500'
                )}
              >
                {step.title}
              </span>
              {step.isOptional && <span className='text-xs text-gray-400 mt-1'>Optional</span>}
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4 transition-colors',
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className='animate-fade-in'>{steps[currentStep]?.content}</div>
    </div>
  );
}

// Smart Disclosure based on user behavior
interface SmartDisclosureProps {
  children: React.ReactNode;
  triggerText: string;
  priority?: 'low' | 'medium' | 'high';
  userInteractionRequired?: boolean;
  autoExpand?: boolean;
  className?: string;
}

export function SmartDisclosure({
  children,
  triggerText,
  priority = 'medium',
  userInteractionRequired = false,
  autoExpand = false,
  className,
}: SmartDisclosureProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [autoExpandTimer, setAutoExpandTimer] = React.useState<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (autoExpand && !userInteractionRequired && priority === 'high') {
      const timer = setTimeout(() => {
        if (!hasInteracted) {
          setIsExpanded(true);
        }
      }, 3000); // Auto-expand after 3 seconds for high priority items

      setAutoExpandTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [autoExpand, userInteractionRequired, priority, hasInteracted]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    setHasInteracted(true);

    if (autoExpandTimer) {
      clearTimeout(autoExpandTimer);
      setAutoExpandTimer(null);
    }
  };

  const priorityStyles = {
    low: 'text-gray-600 border-gray-200',
    medium: 'text-gray-700 border-gray-300',
    high: 'text-primary border-primary/30 bg-primary/5',
  };

  return (
    <div className={cn('border rounded-xl', priorityStyles[priority], className)}>
      <button
        onClick={handleToggle}
        className='w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors focus-smooth'
      >
        <span className='font-medium'>{triggerText}</span>
        <div className='flex items-center space-x-2'>
          {priority === 'high' && !hasInteracted && (
            <div className='w-2 h-2 bg-primary rounded-full animate-pulse' />
          )}
          {isExpanded ? <Minus className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
        </div>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className='p-4 pt-0 border-t border-gray-100'>{children}</div>
      </div>
    </div>
  );
}

// Contextual Help component
interface ContextualHelpProps {
  content: React.ReactNode;
  trigger?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function ContextualHelp({
  content,
  trigger,
  position = 'bottom',
  className,
}: ContextualHelpProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className={cn('relative inline-block', className)}>
      {trigger ? (
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
          className='cursor-help'
        >
          {trigger}
        </div>
      ) : (
        <button
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
          className='w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors focus-smooth'
          aria-label='Help information'
        >
          <Info className='w-5 h-5' />
        </button>
      )}

      <div
        className={cn(
          'absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg transition-all duration-200 pointer-events-none',
          position === 'bottom' && 'top-full mt-2',
          position === 'top' && 'bottom-full mb-2',
          position === 'right' && 'left-full ml-2',
          position === 'left' && 'right-full mr-2',
          isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        style={{
          maxWidth: '250px',
        }}
      >
        {content}

        {/* Arrow */}
        <div
          className={cn(
            'absolute w-2 h-2 bg-gray-900 transform rotate-45',
            position === 'bottom' && '-top-1 left-1/2 -translate-x-1/2',
            position === 'top' && '-bottom-1 left-1/2 -translate-x-1/2',
            position === 'right' && '-left-1 top-1/2 -translate-y-1/2',
            position === 'left' && '-right-1 top-1/2 -translate-y-1/2'
          )}
        />
      </div>
    </div>
  );
}
