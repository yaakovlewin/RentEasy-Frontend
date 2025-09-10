import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class values and merges Tailwind CSS classes intelligently.
 * This prevents style conflicts when combining Tailwind utility classes.
 *
 * @example
 * cn('px-2 py-1', 'px-3') // Returns: 'py-1 px-3'
 * cn('text-red-500', condition && 'text-blue-500') // Conditionally applies classes
 *
 * @param inputs - Class values to combine
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generates CSS variables from a color object for dynamic theming
 * @param colors - Object with color key-value pairs
 * @returns CSS variables object
 */
export function generateCSSVariables(colors: Record<string, string>): Record<string, string> {
  return Object.entries(colors).reduce(
    (acc, [key, value]) => {
      acc[`--color-${key}`] = value;
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Creates responsive class names based on breakpoints
 * @param base - Base class
 * @param responsive - Responsive modifiers
 * @returns Responsive class string
 */
export function responsive(
  base: string,
  responsive?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }
): string {
  if (!responsive) return base;

  const classes = [base];

  if (responsive.sm) classes.push(`sm:${responsive.sm}`);
  if (responsive.md) classes.push(`md:${responsive.md}`);
  if (responsive.lg) classes.push(`lg:${responsive.lg}`);
  if (responsive.xl) classes.push(`xl:${responsive.xl}`);
  if (responsive['2xl']) classes.push(`2xl:${responsive['2xl']}`);

  return classes.join(' ');
}
